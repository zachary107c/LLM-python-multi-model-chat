import os
import logging
from typing import List, Dict
from google import genai
from google.genai import types
from google.genai import Client
from .base_llm_service import BaseLLMService

types.Part.from_bytes

class GoogleAIService(BaseLLMService):
    """
    A service class for interacting with Google's AI API.
    """

    def __init__(self, api_key: str = None, client: Client = None):
        """
        Initializes the GoogleAIService with the necessary API key for authentication.

        Args:
            api_key (str): The Google AI API key.
        """
        if key := (api_key or os.getenv("GEMINI_API_KEY")):
            self.client = client or Client(api_key=key)
        else:
            self.client = None

        self.logger = logging.getLogger(__name__)

    def chat(self, model: str, messages: List[Dict[str, str]], **kwargs) -> Dict:
        """
        Sends a chat request to the Google AI API.

        Args:
            model (str): The name of the model to use.
            messages (List[Dict[str, str]]): Messages for the conversation.
                Each message should include 'role' and 'content'.

        Returns:
            Dict: API response containing chat completion data.
        """
        if not self.client:
            return {"error": "GoogleAI Service is not initialized. Please set the GEMINI_API_KEY."}

        try:
            response: types.GenerateContentResponse = self.client.models.generate_content(model=model, contents=[self.map_payload_to_provider(message) for message in messages], **kwargs)
            return response.model_dump_json()
        except Exception as e:
            self.logger.error(f"Google AI API request failed: {e}")
            return {"error": str(e)}

    def chat_stream(self, model: str, messages: List[Dict[str, str]], **kwargs):
        """
        Sends a chat completion request to the Google API with streaming enabled.

        Args:
            model (str): The name of the model to use for the chat.
            messages (List[Dict[str, str]]): A list of dictionaries representing the chat messages.
                Each dictionary should include 'role' (either 'system', 'user', or 'assistant') and 'content' (str).
            **kwargs: Additional parameters passed to the Google API call.

        Yields:
            Dict: Stream chunks from the API containing partial chat completion data.
        """
        if not self.client:
            yield {
                "error": "Google Service is not initialized. Please ensure the .env has the GEMINI_API_KEY variable set."
            }
            return

        try:
            response = self.client.models.generate_content_stream(model=model, contents=[self.map_payload_to_provider(message) for message in messages])
            for chunk in response:
                if chunk is not None and chunk.text is not None:
                    yield {
                        "message": {
                            "content": chunk.text,
                            "role": "assistant",
                        }
                    }

        except Exception as e:
            self.logger.error(f"Google API streaming request failed: {e}")
            yield {"error": str(e)}

    def get_models(self) -> List[Dict]:
        if not self.client:
            return {"error": "GoogleAI Service is not initialized. Please set the GEMINI_API_KEY."}

        try:
            models_list = self.client.models.list()
            return models_list
        except Exception as e:
            self.logger.error(f"Failed to retrieve models: {e}")
            return {"error": str(e)}

    def get_model(self, model_name: str) -> Dict:
        if not self.client:
            return {"error": "GoogleAI Service is not initialized. Please set the GEMINI_API_KEY."}

        try:
            model_info = self.client.models.get(model_name=model_name)
            return model_info
        except Exception as e:
            self.logger.error(f"Failed to retrieve model details: {e}")
            return {"error": str(e)}
    
    def map_payload_to_provider(self, message):
        mapped_message = {
            "role": message.get("role", "user"),
            "parts": [{"text": message.get("content", "")}]
        }
        
        if images := message.get("images", []):
            for image in images:
                mapped_message["parts"].append({
                    "inline_data": {
                        "mime_type": image.get("type", ""),
                        "data": image.get("data", "")
                    }
                })

        return mapped_message
    