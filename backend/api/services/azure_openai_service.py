import os
import logging
import openai

from typing import Dict, List
from openai import AzureOpenAI
from .base_llm_service import BaseLLMService


class AzureOpenAIService(BaseLLMService):
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

    def chat_stream(self, model: str, messages: List[Dict[str, str]], **kwargs):
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

    def get_models(self) -> Dict:
        return []

    def get_model(self) -> Dict:
        return {}
    
    def map_payload_to_provider(self, message):
        pass