import os
import openai
import logging
import asyncio
from typing import List, Dict, Callable
from abc import ABC, abstractmethod
from openai import OpenAI, AzureOpenAI
from ollama import Client, RequestError, ResponseError
from .tool_manager import ToolManager
from .models import Tool


class LLMService(ABC):
    @abstractmethod
    def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        use_tools: bool = False,
        user_tools: List[str] | None = None,
        **kwargs,
    ) -> Dict:
        pass

    @abstractmethod
    def get_models(self) -> Dict:
        pass

    @abstractmethod
    def get_model(self) -> Dict:
        pass


class OllamaService(LLMService):
    """
    A service class for interacting with an Ollama API.
    """

    def __init__(self, endpoint: str = None, client: Client = None):
        """
        Initializes the OllamaService.

        Args:
            endpoint (str, optional): The host URL for the Ollama API. Defaults to the environment variable OLLAMA_ENDPOINT.
            client (Client, optional): An instance of the Client class. If not provided, a new Client will be created using the specified endpoint.
        """
        self.endpoint = endpoint or os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")

        if self.endpoint:
            self.client = client or Client(self.endpoint)
        else:
            self.client = None

        self.logger = logging.getLogger(__name__)
        self.tool_manager = ToolManager(
            tools_dir=os.path.join(os.getcwd(), "api", "tools")
        )

    async def process_tool_calls(self, response):
        seen_called_tools = set()
        called_tools = []
        tool_call_results = ""
        for tool in response.message.tool_calls or []:
            entry = (tool.function.name, str(tool.function.arguments).lower())
            if entry in seen_called_tools:
                continue
            seen_called_tools.add(entry)
            try:
                result = await self.tool_manager.run_tool(
                    tool.function.name, **tool.function.arguments
                )
                if result:
                    tool_call_results += f"Function call to tool {tool.function.name}:\n\tArguments: {tool.function.arguments}\n\tResult: {result}\n\n"
                    called_tools.append(tool.function.dict())
            except Exception as e:
                print(f"\t  error: {e}")
                tool_call_results += f"Function call to tool {tool.function.name}:\n\tArguments: {tool.function.arguments}\n\tResult: Error Occurred {e}, no result\n\n"

        return tool_call_results, called_tools

    def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        use_tools: bool = False,
        user_tools: List[str] | None = None,
        **kwargs,
    ) -> Dict:
        """
        Sends a message through the Ollama API.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the messages in the conversation.
                Each dictionary should have at least 'role' and 'content' keys.

        Returns:
            Dict: The response from the Ollama API.

        Raises:
            RequestError, ResponseError: If the API request fails.
        """

        if not self.client:
            return {
                "error": "Ollama Service is not initialized. Please ensure the .env has the OLLAMA_ENDPOINT variable set."
            }

        try:
            if use_tools and user_tools:
                self.tool_manager.load_tools(valid_tools=user_tools)
                tools = self.tool_manager.get_tools(user_tool_ids=user_tools)
                if tools:
                    response = self.client.chat(
                        model=model,
                        messages=messages,
                        stream=False,
                        tools=tools.values(),
                    )

                    data, called_tools = asyncio.run(self.process_tool_calls(response=response))

                    if data:
                        messages.append(
                            {
                                "role": "user",
                                "content": f"Utilize the following information from a tool call you just performed to answer the user's question. Don't reference the fact that you used a tool. If there are any errors, feel free to let the user know about the error.\n\nDATA:\n{data}",
                            }
                        )
                        response = self.client.chat(model=model, messages=messages).model_dump()
                        response["tools_used"] = called_tools
                    else:
                        response = self.client.chat(model=model, messages=messages).model_dump()
                        response["tools_used"] = None
                else:
                    response = self.client.chat(
                        model=model,
                        messages=messages,
                        stream=False,
                    ).model_dump()
                    response["tools_used"] = None
            else:
                response = self.client.chat(
                    model=model,
                    messages=messages,
                    stream=False,
                ).model_dump()
                response["tools_used"] = None

            return response
        except (RequestError, ResponseError) as e:
            print(f"API request failed: {e}")
            return {"error": str(e)}

    def chat_stream(
        self,
        model: str,
        messages: List[Dict[str, str]],
        use_tools: bool = False,
        user_tools: List[str] | None = None,
        **kwargs,
    ):
        """
        Sends a message through the Ollama API with streaming enabled.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the messages in the conversation.
                Each dictionary should have at least 'role' and 'content' keys.

        Returns:
            Generator: A generator that yields responses from the Ollama API.

        Raises:
            RequestError, ResponseError: If the API request fails.
        """
        if not self.client:
            yield {
                "error": "Ollama Service is not initialized. Please ensure the .env has the OLLAMA_ENDPOINT variable set."
            }
            return

        try:
            if use_tools and user_tools:
                self.tool_manager.load_tools(valid_tools=user_tools)
                tools = self.tool_manager.get_tools(user_tool_ids=user_tools)
                if tools:
                    response = self.client.chat(
                        model=model,
                        messages=messages,
                        stream=False,
                        tools=tools.values(),
                    )

                    data, called_tools = asyncio.run(self.process_tool_calls(response=response))

                    print(f"Called Tools: {called_tools}")

                    if data:
                        messages.append(
                            {
                                "role": "user",
                                "content": f"Utilize the following information from a tool call you just performed to answer the user's question. Don't reference the fact that you used a tool.\n\nDATA:\n{data}",
                            }
                        )
                        for response in self.client.chat(
                            model=model, messages=messages, stream=True
                        ):
                            response = response.model_dump()
                            response["tools_used"] = called_tools
                            yield response
                    else:
                        for response in self.client.chat(
                            model=model, messages=messages, stream=True
                        ):
                            response = response.model_dump()
                            response["tools_used"] = None
                            yield response
                else:
                    for response in self.client.chat(
                        model=model, messages=messages, stream=True
                    ):
                        response = response.model_dump()
                        response["tools_used"] = None
                        yield response
            else:
                for response in self.client.chat(
                    model=model, messages=messages, stream=True
                ):
                    response = response.model_dump()
                    response["tools_used"] = None
                    yield response
        except (RequestError, ResponseError) as e:
            print(f"API request failed: {e}")
            yield {"error": str(e)}

    def get_models(self) -> List[Dict]:
        """
        Retrieves a list of available models from the Ollama API.

        Returns:
            List[Dict]: A list of dictionaries representing the available models.

        Raises:
            RequestError, ResponseError: If the API request fails.
        """

        if not self.client:
            return {
                "error": "Ollama Service is not initialized. Please ensure the .env has the OLLAMA_ENDPOINT variable set."
            }

        try:
            models_list = self.client.list()
            return models_list
        except (RequestError, ResponseError) as e:
            self.logger.error(f"Failed to retrieve models: {e}")
            return {"error": str(e)}

    def get_model(self, model_name: str) -> Dict:
        if not self.client:
            return {
                "error": "Ollama Service is not initialized. Please ensure the .env has the OLLAMA_ENDPOINT variable set."
            }

        try:
            model_info = self.client.show(model=model_name)
            return model_info
        except (RequestError, ResponseError) as e:
            return {"error": str(e)}


class OpenAIService(LLMService):
    """
    A service class for interacting with OpenAI's Chat Completions API.
    """

    def __init__(self, api_key: str = None, client: OpenAI = None):
        """
        Initializes the OpenAIService with the necessary API key for authentication.

        Args:
            api_key (str): The OpenAI API key.
        """

        if key := (api_key or os.getenv("OPENAI_API_KEY")):
            self.client = client or OpenAI(api_key=key)
        else:
            self.client = None

        self.logger = logging.getLogger(__name__)

    def chat(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
        """
        Sends a chat completion request to the OpenAI API.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the OpenAI API call.

        Returns:
            Dict: The response dict from the API containing chat completion data.

        Raises:
            openai.error.OpenAIError: If the API request fails.
        """
        if not self.client:
            return {
                "error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."
            }

        try:
            from openai.types.chat import ChatCompletion

            response: ChatCompletion = self.client.chat.completions.create(
                model=model, messages=messages
            )

            response_json = response.model_dump()

            response_json["message"] = response_json["choices"][0]["message"]
            del response_json["choices"]

            return response_json
        except Exception as e:
            self.logger.error(f"OpenAI API request failed: {e}")
            return {"error": str(e)}

    def chat_stream(self, model: str, messages: List[Dict[str, str]], **kwargs):
        """
        Sends a chat completion request to the OpenAI API with streaming enabled.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the OpenAI API call.

        Yields:
            Dict: Stream chunks from the API containing partial chat completion data.
        """
        if not self.client:
            yield {
                "error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."
            }
            return

        try:
            stream = self.client.chat.completions.create(
                model=model, messages=messages, stream=True
            )

            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield {
                        "message": {
                            "content": chunk.choices[0].delta.content,
                            "role": "assistant",
                        }
                    }

        except Exception as e:
            self.logger.error(f"OpenAI API streaming request failed: {e}")
            yield {"error": str(e)}

    def get_models(self) -> Dict:
        if not self.client:
            return {
                "error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."
            }

        model_list = self.client.models.list()

        print("Model list:", model_list)

        return []

    def get_model(self) -> Dict:
        if not self.client:
            return {
                "error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."
            }

        return {}


class AzureOpenAIService(LLMService):
    """
    A service class for interacting with Azure's implementation of OpenAI's Chat Completions API.
    """

    def __init__(
        self,
        api_key: str = None,
        azure_endpoint: str = None,
        api_version: str = None,
        client: AzureOpenAI = None,
    ):
        """
        Initializes the AzureOpenAIService with the necessary API key and endpoint URL.

        Args:
            api_key (str): The Azure OpenAI API key.
            endpoint (str): The endpoint URL for the Azure OpenAI API.
        """
        self.logger = logging.getLogger(__name__)

        if client:
            self.client = client
        else:
            if (
                not (api_key or os.getenv("AZURE_OPENAI_API_KEY"))
                or not (azure_endpoint or os.getenv("AZURE_OPENAI_ENDPOINT"))
                or not (api_version or os.getenv("AZURE_OPENAI_API_VERSION"))
            ):
                self.client = None
            else:
                self.client = AzureOpenAI(
                    api_key=api_key or os.getenv("AZURE_OPENAI_API_KEY"),
                    azure_endpoint=azure_endpoint or os.getenv("AZURE_OPENAI_ENDPOINT"),
                    api_version=api_version or os.getenv("AZURE_OPENAI_API_VERSION"),
                )

    def chat(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
        """
        Sends a chat completion request to the Azure OpenAI API.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the OpenAI API call.

        Returns:
            Dict: The response dict from the API containing chat completion data.

        Raises:
            openai.error.OpenAIError: If the API request fails.
        """

        if not self.client:
            return {"error": "Missing either Azure endpoint, apikey, or version."}

        try:
            from openai.types.chat import ChatCompletion

            response: ChatCompletion = self.client.chat.completions.create(
                model=model, messages=messages, **kwargs
            )
            return response.model_dump()
        except openai.error.OpenAIError as e:
            self.logger.error(f"Azure OpenAI API request failed: {e}")
            return {"error": str(e)}

    def get_models(self) -> Dict:
        return []

    def get_model(self) -> Dict:
        return {}

    def chat_stream(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
        """
        Sends a chat completion request to the Azure OpenAI API with streaming enabled.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the Azure OpenAI API call.

        Yields:
            Dict: Stream chunks from the API containing partial chat completion data.
        """
        if not self.client:
            yield {"error": "Missing either Azure endpoint, apikey, or version."}
            return

        try:
            stream = self.client.chat.completions.create(
                model=model, messages=messages, stream=True, **kwargs
            )

            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield {
                        "message": {
                            "content": chunk.choices[0].delta.content,
                            "role": "assistant",
                        }
                    }

        except Exception as e:
            self.logger.error(f"Azure OpenAI API streaming request failed: {e}")
            yield {"error": str(e)}


class LLMServiceFactory:
    @staticmethod
    def get_service(provider: str = "ollama") -> LLMService:
        if provider == "ollama":
            return OllamaService()
        elif provider == "openai":
            return OpenAIService()
        elif provider == "azure_openai":
            return AzureOpenAIService()
        else:
            return None
