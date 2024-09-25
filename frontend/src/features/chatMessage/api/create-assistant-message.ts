import { z } from 'zod';
import { api } from '@/lib/api-client';
import { AssistantMessage } from '@/types/api';
import Cookies from 'js-cookie';

export const createAssistantMessageInputSchema = z.object({
  conversation: z.string(),
  content: z.string(),
  model: z.string(),
  provider: z.string(),
});

export type CreateAssistantMessageInput = z.infer<typeof createAssistantMessageInputSchema>;

export const createAssistantMessage = async ({ data }: { data: CreateAssistantMessageInput }): Promise<AssistantMessage> => {
  const response = await api.post(`/messages/assistant/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
  return response.data;
};
