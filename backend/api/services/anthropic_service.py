import os
import logging

from typing import Dict, List
from anthropic import Anthropic
from .base_llm_service import BaseLLMService

class AnthropicService(BaseLLMService):
    """
    A service class for interacting with Anthrpic's Chat Completions API.
    """

    def __init__(self, api_key: str = None, client: Anthropic = None):
        """
        Initializes the AnthropicService with the necessary API key for authentication.

        Args:
            api_key (str): The Anthropic API key.
        """

        if key := (api_key or os.getenv("ANTHROPIC_API_KEY")):
            self.client = client or Anthropic(api_key=key)
        else:
            self.client = None

        self.logger = logging.getLogger(__name__)

    def chat(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
        """
        Sends a chat completion request to the Anthropic API.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the Anthropic API call.

        Returns:
            Dict: The response dict from the API containing chat completion data.

        Raises:
            Anthropic.error.AnthropicError: If the API request fails.
        """
        if not self.client:
            return {
                "error": "Anthropic Service is not initialized. Please ensure the .env has the ANTHROPIC_API_KEY variable set."
            }

        try:
            from anthropic.types.completion import Completion

            response: Completion = self.client.messages.create(
                model=model, messages=messages, max_tokens=4096
            )
            response_json = response.model_dump()
            response_json["message"] = {"content": response_json["content"][0]["text"]}
            return response_json
        except Exception as e:
            self.logger.error(f"Anthropic API request failed: {e}")
            return {"error": str(e)}

    def chat_stream(self, model: str, messages: List[Dict[str, str]], **kwargs):
        """
        Sends a chat completion request to the Anthropic API with streaming enabled.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the Anthropic API call.

        Yields:
            Dict: Stream chunks from the API containing partial chat completion data.
        """
        if not self.client:
            yield {
                "error": "Anthropic Service is not initialized. Please ensure the .env has the ANTHROPIC_API_KEY variable set."
            }
            return

        try:
            with self.client.messages.stream(
                model=model, messages=messages, max_tokens=4096
            ) as stream:
                for text in stream.text_stream:
                    if text is not None:
                        yield {
                            "message": {
                                "content": text,
                                "role": "assistant",
                            }
                        }

        except Exception as e:
            self.logger.error(f"Anthropic API streaming request failed: {e}")
            yield {"error": str(e)}

    def get_models(self) -> Dict:
        if not self.client:
            return {
                "error": "Anthropic Service is not initialized. Please ensure the .env has the ANTHROPIC_API_KEY variable set."
            }

        model_list = self.client.models.list()
        return []

    def get_model(self) -> Dict:
        if not self.client:
            return {
                "error": "Anthropic Service is not initialized. Please ensure the .env has the ANTHROPIC_API_KEY variable set."
            }

        return {}

