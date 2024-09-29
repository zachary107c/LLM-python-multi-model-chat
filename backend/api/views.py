import requests
from io import StringIO

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


class OllamaModelListCreateView(generics.ListCreateAPIView):
    queryset = OllamaModel.objects.all()
    serializer_class = OllamaModelSerializer
    permission_classes = [IsAuthenticated]


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


class OllamaModelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OllamaModel.objects.all()
    serializer_class = OllamaModelSerializer
    permission_classes = [IsAuthenticated]


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


class OllamaModelInfoView(APIView):

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = OllamaService(url="http://192.168.1.11:11434")

    def post(self, request):
        try:
            model= request.data.get("model")

            if not model:
                return Response(
                    {"error": "Model is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            model_info = self.ollama_service.model(model)

            if model_info:
                return Response(model_info, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Failed to fetch response from Ollama API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
