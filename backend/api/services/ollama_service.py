import os
import asyncio
import logging

from typing import List, Dict
from ollama import Client, RequestError, ResponseError
from .base_llm_service import BaseLLMService
from .tool_service import ToolManager

class OllamaService(BaseLLMService):
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
        self.logger = logging.getLogger(__name__)
        self.client = client or Client(endpoint or os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434"))
        self.tool_manager = ToolManager(tools_dir=os.path.join(os.getcwd(), "api", "tools"))

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
            called_tools = None
            if use_tools and user_tools:
                self.tool_manager.load_tools(valid_tools=user_tools)
                tools = self.tool_manager.get_tools(user_tool_ids=user_tools)

                if tools:
                    response = self.client.chat(
                        model=model,
                        messages=[self.map_payload_to_provider(message) for message in messages],
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
                        
            response = self.client.chat(
                model=model,
                messages=[self.map_payload_to_provider(message) for message in messages],
                stream=False,
            ).model_dump()
            response["tools_used"] = called_tools

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
            called_tools = None
            if use_tools and user_tools:
                self.tool_manager.load_tools(valid_tools=user_tools)
                tools = self.tool_manager.get_tools(user_tool_ids=user_tools)

                if tools:
                    response = self.client.chat(
                        model=model,
                        messages=[self.map_payload_to_provider(message) for message in messages],
                        stream=False,
                        tools=tools.values(),
                    )

                    data, called_tools = asyncio.run(self.process_tool_calls(response=response))

                    self.logger.info(f"Called Tools: {called_tools}")

                    if data:
                        messages.append({
                            "role": "user",
                            "content": f"Utilize the following information from a tool call you just performed to answer the user's question. Don't reference the fact that you used a tool.\n\nDATA:\n{data}",
                        })

            for response in self.client.chat(model=model, messages=[self.map_payload_to_provider(message) for message in messages], stream=True):
                response = response.model_dump()
                response["tools_used"] = called_tools
                yield response
        except (RequestError, ResponseError) as e:
            self.logger.error(f"API request failed: {e}")
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
    
    def map_payload_to_provider(self, message):
        mapped_message = {
            "role": message.get("role", "user"),
            "content": message.get("content", "")
        }

        if images := message.get("images", []):
            mapped_message["images"] = [image["base64"] for image in images]

        return mapped_message
