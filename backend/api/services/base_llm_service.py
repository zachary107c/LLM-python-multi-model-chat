from typing import List, Dict
from abc import ABC, abstractmethod

class BaseLLMService(ABC):
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
    
    def chat_stream(
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
    
    @abstractmethod
    def map_payload_to_provider(self, message):
        pass