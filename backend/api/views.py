import requests
from io import StringIO

import datetime
from django.core.management import call_command
from rest_framework.views import *
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Conversation, UserMessage, AssistantMessage, OllamaModel
from .serializers import (
    ConversationSerializer,
    UserMessageSerializer,
    AssistantMessageSerializer,
    ConversationDetailSerializer,
    OllamaModelSerializer,
)
from .services import OllamaService


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

        for conversation in serializer.data:
            created_at = datetime.datetime.fromisoformat(conversation['created_at'].replace('Z', '+00:00'))
            if (datetime.date.today() - created_at.date()).days == 0:
                conversation['grouping'] = 'Today'
            elif (datetime.date.today() - created_at.date()).days <= 7:
                conversation['grouping'] = 'This Week'
            elif (datetime.date.today().month == int(created_at.strftime('%m'))):
                conversation['grouping'] = 'This Month'
            else:
                conversation['grouping'] = 'Old'

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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


class OllamaModelListCreateView(generics.ListCreateAPIView):
    queryset = OllamaModel.objects.all()
    serializer_class = OllamaModelSerializer
    permission_classes = [IsAuthenticated]


class OllamaModelDetailWithInfoView(APIView):

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService(url="http://192.168.1.11:11434")

    # Fetch and combine model data and Ollama details (GET)
    def get(self, request, pk):
        try:
            # Fetch model from the database using the primary key (pk)
            ollama_model = OllamaModel.objects.get(pk=pk)
            serializer = OllamaModelSerializer(ollama_model)

            # Query the Ollama API for additional details
            model_info = self.ollama_service.model(serializer.data['name'])

            if model_info:
                # Remove unnecessary fields from the Ollama response
                del model_info["details"]
                del model_info["model_info"]

                # Combine the database model data with the Ollama service response
                combined_data = {
                    **serializer.data,   # The serialized model data from the database
                    "details": model_info  # The extra details fetched from Ollama
                }

                return Response(combined_data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Failed to fetch response from Ollama API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except OllamaModel.DoesNotExist:
            return Response(
                {"error": "Model not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Update a model (PUT)
    def put(self, request, pk):
        try:
            ollama_model = OllamaModel.objects.get(pk=pk)
            serializer = OllamaModelSerializer(ollama_model, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except OllamaModel.DoesNotExist:
            return Response(
                {"error": "Model not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    # Delete a model (DELETE)
    def delete(self, request, pk):
        try:
            ollama_model = OllamaModel.objects.get(pk=pk)
            ollama_model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except OllamaModel.DoesNotExist:
            return Response(
                {"error": "Model not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class OllamaModelsPopulateAPIView(APIView):
    """
    View to handle chat requests with the Ollama API.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService(url="http://192.168.1.11:11434")

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


class OllamaChatAPIView(APIView):
    """
    View to handle chat requests with the Ollama API.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService(url="http://192.168.1.11:11434")

    def post(self, request):
        try:
            model = request.data.get("model")
            messages = request.data.get("messages")

            if not model or not messages:
                return Response(
                    {"error": "Model and messages are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            chat_completion = self.ollama_service.chat(model, messages)

            if chat_completion:
                return Response(chat_completion, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Failed to fetch response from Ollama API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
