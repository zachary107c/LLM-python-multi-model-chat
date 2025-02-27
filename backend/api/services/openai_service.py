import os
import logging

from typing import Dict, List
from openai import OpenAI
from .base_llm_service import BaseLLMService

class OpenAIService(BaseLLMService):
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
                model=model, messages=[self.map_payload_to_provider(message) for message in messages]
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
                model=model, messages=[self.map_payload_to_provider(message) for message in messages], stream=True
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

    def map_payload_to_provider(self, message):
        mapped_message = {
            "role": message.get("role", "user"),
            "content": [{"type": "text", "text": message.get("content", "")}]
        }
        
        mapped_message["content"].extend(
            {"type": "image_url", "image_url": {"url": f"data:{image['type']};base64,{image['data']}"}}
            for image in message.get("images", [])
        )

        return mapped_message
