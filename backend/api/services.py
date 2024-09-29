import logging
from typing import List, Dict
from ollama import Client, RequestError, ResponseError


class OllamaService:
    """
    A service class for interacting with an Ollama API.
    """

    def __init__(self, url: str, client: Client = None):
        """
        Initializes the OllamaService with a given URL.
        
        Args:
            url (str): The host URL for the Ollama API.
            client (Client, optional): An instance of the Client class. If not provided, a new Client will be created.
        """
        self.url = url
        self.client = client or Client(host=url)
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
        try:
            response = self.client.chat(model=model, messages=messages, stream=False)
            return response
        except (RequestError, ResponseError) as e:
            self.logger.error(f"API request failed: {e}")
            return None

    def models(self) -> List[Dict]:
        """
        Retrieves a list of available models from the Ollama API.
        
        Returns:
            List[Dict]: A list of dictionaries representing the available models.

        Raises:
            RequestError, ResponseError: If the API request fails.
        """
        self.logger.debug("Retrieving available models")
        try:
            models_list = self.client.list()
            return models_list
        except(RequestError, ResponseError) as e:
            self.logger.error(f"Failed to retrieve models: {e}")
            return None