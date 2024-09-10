from rest_framework.views import *
from rest_framework.permissions import *
from rest_framework.response import Response
from rest_framework import status, generics
from .models import Conversation, UserMessage, AssistantMessage, OllamaModel
from .serializers import (
    ConversationSerializer,
    UserMessageSerializer,
    AsistantMessageSerializer,
    ConversationDetailSerializer,
    OllamaModelSerializer,
)


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
    serializer_class = AsistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(conversation__user=self.request.user)

    def get(self, request):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class AssistantMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = None
    serializer_class = AsistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(conversation__user=self.request.user)

    def get_object(self):
        message = super().get_object()

        if message.conversation.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this message.")

        return message


class OllamaModelListCreateView(generics.ListCreateAPIView):
    queryset = OllamaModel.objects.all()
    serializer_class = OllamaModelSerializer
    permission_classes = [IsAuthenticated]


class OllamaModelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OllamaModel.objects.all()
    serializer_class = OllamaModelSerializer
    permission_classes = [IsAuthenticated]
