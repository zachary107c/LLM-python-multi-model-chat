import { useToast } from '@/hooks/use-toast';
import { env } from '@/config/env';
import urlJoin from 'url-join';
import { userInfo } from 'os';

type RequestConfig = {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  maxContentLength?: number;
  maxBodyLength?: number;
};

interface StreamChunk {
  content?: string;
  status?: 'generating' | 'cancelled' | 'error';
  error?: string;
}

function authRequestHeaders(): Headers {
  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }

  return headers;
}

class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;

  constructor(baseURL: string, config: RequestConfig = {}) {
    this.baseURL = baseURL;
    this.defaultConfig = {
      withCredentials: true,
      maxContentLength: 200 * 1024 * 1024,
      maxBodyLength: 200 * 1024 * 1024,
      ...config,
    };
  }

  private getHeaders(config: RequestConfig = {}): Headers {
    const isStreaming = config.headers?.Accept === 'text/event-stream';
    const headers = new Headers();

    // Only set Content-Type if it's not explicitly set in config
    if (!config.headers?.['Content-Type']) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', isStreaming ? 'text/event-stream' : 'application/json');

    if (config.headers) {
      Object.entries(config.headers).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Token ${token}`);
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'Network response was not ok';
      let errorData: any = {};
  
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
  
      // Handle Unauthorized Access (401)
      if (response.status === 401) {
        console.log("401 status received, redirecting to login.");
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirectTo') || window.location.pathname;
        window.location.href = '/login';
      }

      const error = new Error(errorMessage);
      (error as any).response = { status: response.status, data: errorData };
      throw error;
    }
    return response;
  }

  private getFullURL(endpoint: string): string {
    const base = this.baseURL.startsWith('http')
      ? this.baseURL
      : `${window.location.origin}/${this.baseURL}`;

    return urlJoin(base, endpoint).replace(/([^:]\/)\/+/g, '$1');
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.getFullURL(endpoint));
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: authRequestHeaders(),
      credentials: 'include',
    });

    await this.handleResponse(response);
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    try {
      console.log('POST Request Data:', data);
      console.log('Making POST request to:', endpoint, 'with data:', data);
  
      // Determine if the data is FormData
      const isFormData = data instanceof FormData;
  
      // Don't set Content-Type for FormData, let the browser handle it
      const headers = this.getHeaders(config);
      if (isFormData) {
        headers.delete('Content-Type');
      }
  
      const response = await fetch(this.getFullURL(endpoint), {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        // Don't stringify if it's FormData
        body: isFormData ? data : JSON.stringify(data),
      });
  
      console.log('POST Response:', response);
  
      await this.handleResponse(response);
  
      if (config.headers?.Accept === 'text/event-stream') {
        return response.body as unknown as T;
      }
  
      // Handle empty responses (like from logout endpoint)
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return null as T;
      }
  
      try {
        return await response.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          // If response is empty or not JSON, return null
          return null as T;
        }
        throw error;
      }
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PUT',
      headers: authRequestHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    await this.handleResponse(response);
    return response.json();
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(this.getFullURL(endpoint), {
      method: 'PATCH',
      headers: authRequestHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await this.handleResponse(response);
    return response.json();
  }

  async delete<T>(endpoint: string, data?: unknown): Promise<T> {
    try {
      console.log('DELETE Request to:', endpoint);

      const response = await fetch(this.getFullURL(endpoint), {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log('DELETE Response:', response);

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers));
        const errorText = await response.text();
        console.error('Response body:', errorText);
        throw new Error(response.statusText || 'Network response was not ok');
      }

      // Handle empty responses
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || response.status === 204) {
        return null as T;
      }

      try {
        return await response.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          // If response is empty or not JSON, return null
          return null as T;
        }
        throw error;
      }
    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
  }

  async streamCompletion(
    data: unknown,
    onChunk: (chunk: string | StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    try {

      if (signal) {
        signal.addEventListener('abort', () => {
          throw new DOMException('Request aborted', 'AbortError');
        });
      }

      const response = await fetch(this.getFullURL('/completions/chat/'), {
        method: 'POST',
        headers: this.getHeaders({
          headers: {
            Accept: 'text/event-stream',
            'Content-Type': 'application/json',
          }
        }),
        credentials: 'include',
        body: JSON.stringify(data),
        signal,
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers));
        const errorText = await response.text();
        console.error('Response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        if (signal?.aborted) {
          throw new DOMException('Request aborted', 'AbortError');
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.slice(6));
              onChunk(data);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.log('Error in streamCompletion:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Abort detected in streamCompletion');
          throw error;
        }
      } else {
        console.error('Caught an unknown error', error);
      }
    } finally {

    }
  }
}

export const api = new ApiClient(urlJoin(env.BACKEND_API_URL));

export default api;