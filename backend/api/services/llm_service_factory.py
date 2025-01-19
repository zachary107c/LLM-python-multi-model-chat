from .base_llm_service import BaseLLMService
from .ollama_service import OllamaService
from .openai_service import OpenAIService
from .azure_openai_service import AzureOpenAIService

class LLMServiceFactory:
    @staticmethod
    def get_service(provider: str = "ollama") -> BaseLLMService:
        if provider == "ollama":
            return OllamaService()
        elif provider == "openai":
            return OpenAIService()
        elif provider == "azure_openai":
            return AzureOpenAIService()
        else:
            return None
