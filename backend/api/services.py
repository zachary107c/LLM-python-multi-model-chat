import os
import openai
import logging
from typing import List, Dict
from abc import ABC, abstractmethod
from openai import OpenAI, AzureOpenAI
from ollama import Client, RequestError, ResponseError


class LLMService(ABC):
    @abstractmethod
    def chat(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
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
        self.endpoint = endpoint or os.getenv("OLLAMA_ENDPOINT")

        if self.endpoint:
            self.client = client or Client(self.endpoint)
        else:
            self.client = None

        self.logger = logging.getLogger(__name__)

    def chat(self, model: str, messages: List[Dict[str, str]]) -> Dict:
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
            response = self.client.chat(model=model, messages=messages, stream=False)
            return response
        except (RequestError, ResponseError) as e:
            self.logger.error(f"API request failed: {e}")
            return {"error": str(e)}

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
            return {"error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."}

        try:
            from openai.types.chat import ChatCompletion
            response: ChatCompletion = self.client.chat.completions.create(
                model=model, messages=messages, **kwargs
            )

            response_json = response.model_dump()

            response_json["message"] = response_json["choices"][0]["message"]
            del response_json["choices"]

            return response_json
        except Exception as e:
            self.logger.error(f"OpenAI API request failed: {e}")
            return {"error": str(e)}

    def get_models(self) -> Dict:
        if not self.client:
            return {"error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."}

        model_list = self.client.models.list()

        print("Model list:", model_list)

        return []

    def get_model(self) -> Dict:
        if not self.client:
            return {"error": "OpenAI Service is not initialized. Please ensure the .env has the OPENAI_API_KEY variable set."}

        return {}


class AzureOpenAIService(LLMService):
    """
    A service class for interacting with Azure's implementation of OpenAI's Chat Completions API.
    """

    def __init__(self, api_key: str = None, azure_endpoint: str = None, api_version: str = None, client: AzureOpenAI = None):
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
        pass

    def get_model(self) -> Dict:
        pass


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
