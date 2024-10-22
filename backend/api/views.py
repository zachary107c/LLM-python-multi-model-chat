import os
import json
import pytz
import requests
import datetime
from io import StringIO
from django.core.management import call_command
from rest_framework.views import *
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Conversation, UserMessage, AssistantMessage, Model
from .serializers import (
    ConversationSerializer,
    UserMessageSerializer,
    AssistantMessageSerializer,
    ConversationDetailSerializer,
    ModelSerializer,
)
from .services import OllamaService, OpenAIService, AzureOpenAIService, LLMServiceFactory

PROMPTS = {
    "three_suggestions": "You are an expert suggestion generator.\nYou generate three random questions a user could potentially ask to LLM, helping the user get started with a conversation.\nFor each of the questions you generate, you also generate a bucket title this question / request falls under.\nSome bucket examples might be:\n- Programming Questions\n- Fun Facts\n- General Knowledge\n- Story Creation\n- Jokes and Humor\n- etc\n\nResponse with three questions and their corresponding bucket as a json payload. Make the questions detailed an unique.\n\nExample response format:\n{\n  \"suggestions\": [\n    {\n      \"bucket\": \"Programming Questions\",\n      \"question\": \"How do I reverse a string in Python?\"\n    },\n    {\n      \"bucket\": \"Fun Facts\",\n      \"question\": \"What are some interesting facts about the universe?\"\n    },\n    {\n      \"bucket\": \"Story Creation\",\n      \"question\": \"Can you help me write a short story about a time-traveling detective?\"\n    }\n  ]\n}\n\nOnly repond with the JSON payload surounded in triple back ticks ``` and nothing else."
}


class Index(APIView):
    def get(self, request):
        return Response({"message": "Hello World!"}, status=status.HTTP_200_OK)

    permission_classes = [AllowAny]


class ConversationListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get(self, request):
        conversations = self.get_queryset()
        serializer = self.get_serializer(conversations, many=True)

        utc = pytz.UTC  # UTC timezone instance

        for conversation in serializer.data:
            # Parse and make the `created_at` aware of UTC
            created_at = datetime.datetime.fromisoformat(
                conversation["created_at"].replace("Z", "+00:00")
            ).astimezone(utc)

            # Get current time in UTC
            now_utc = datetime.datetime.now(datetime.UTC)

            # Calculate the time difference in days
            days_difference = (now_utc.date() - created_at.date()).days

            if days_difference == 0:
                conversation["grouping"] = "Today"
            elif days_difference <= 7:
                conversation["grouping"] = "This Week"
            elif now_utc.month == created_at.month:
                conversation["grouping"] = "This Month"
            else:
                conversation["grouping"] = "Old"

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = ConversationDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def get_object(self):
        conversation = super().get_object()

        if conversation.user != self.request.user:
            raise PermissionDenied(
                "You do not have permission to access this conversation."
            )

        return conversation

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class UserListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = UserMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserMessage.objects.filter(conversation__user=self.request.user)

    def get(self, request):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class UserMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = UserMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserMessage.objects.filter(conversation__user=self.request.user)

    def get_object(self):
        message = super().get_object()

        if message.conversation.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this message.")

        return message


class AssistantListCreateView(generics.ListCreateAPIView):
    queryset = None
    serializer_class = AssistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(conversation__user=self.request.user)

    def get(self, request):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class AssistantMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = AssistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(conversation__user=self.request.user)

    def get_object(self):
        message = super().get_object()
        if message.conversation.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this message.")
        return message

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModelListCreateView(generics.ListCreateAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]


class ModelDetailWithInfoView(APIView):

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService()

    # Fetch and combine model data and Ollama details (GET)
    def get(self, request, pk):
        try:
            # Fetch model from the database using the primary key (pk)
            ollama_model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(ollama_model)
            if ollama_model.provider == "Ollama":
                # Query the Ollama API for additional details
                model_info = self.ollama_service.model(serializer.data["name"])

                if model_info:
                    # Remove unnecessary fields from the Ollama response
                    del model_info["details"]
                    del model_info["model_info"]

                    # Combine the database model data with the Ollama service response
                    combined_data = {
                        **serializer.data,  # The serialized model data from the database
                        "details": model_info,  # The extra details fetched from Ollama
                    }

                    return Response(combined_data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"error": "Failed to fetch response from Ollama API."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                combined_data = {
                    **serializer.data,
                    "details": {},  # If the model is not from Ollama, just return an empty details field
                }
                return Response(combined_data, status=status.HTTP_200_OK)
        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Update a model (PUT)
    def put(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(
                ollama_model, data=request.data, partial=True
            )

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )

    # Delete a model (DELETE)
    def delete(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            ollama_model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )


class OllamaModelsPopulateAPIView(APIView):
    """
    View to handle chat requests with the Ollama API.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService()

    def post(self, request):
        try:
            output = StringIO()
            call_command("populate_ollama_models", stdout=output)

            return Response(
                {
                    "message": "Successfully re-populated Ollama models!",
                    "details": output.getvalue(),
                },
                status=status.HTTP_200_OK,
            )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e), "message": "Failed to re-populate Ollama models!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class BaseChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None
    
    def post(self, request):
        try:
            model = request.data.get("model")
            messages = request.data.get("messages")
            provider = request.data.get("provider")

            if not model or not messages or not provider:
                return Response(
                    {"error": "Model, messages, and provider are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response({"error": f"'{provider}' is an invalid provider."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            chat_completion = self.llm_service.chat(model, messages)

            if chat_completion and "error" not in chat_completion:
                return Response(chat_completion, status=status.HTTP_200_OK)
            elif chat_completion and "error" in chat_completion:
                return Response(chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response(
                    {"error": f"Failed to fetch response from {provider} API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BaseThreeSuggestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        model = request.data.get("model")
        provider = request.data.get("provider")

        if not model or not provider:
            return Response(
                {"error": "Model and provider are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        prompt = PROMPTS.get("three_suggestions")
        self.llm_service = LLMServiceFactory.get_service(provider)

        if not self.llm_service:
            return Response({"error": f"'{provider}' is an invalid provider."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        chat_completion = self.llm_service.chat(model=model, messages=[{"role": "user", "content": prompt}])

        if chat_completion and "error" not in chat_completion:
            try:
                payload = json.loads(chat_completion["message"]["content"].replace("```json", "").replace("```", ""))
                return Response(payload, status=status.HTTP_200_OK)
            except Exception as e:
                chat_completion["external_message"] = f"Failed to decode the json -> {e}"
                return Response(chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif chat_completion and "error" in chat_completion:
            return Response(chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(
                {"error": f"Failed to fetch response from {provider} API."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChatAPIView(BaseChatAPIView):
    pass


class ThreeSuggestionsAPIView(BaseThreeSuggestionsAPIView):
    pass