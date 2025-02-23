from django.shortcuts import get_object_or_404

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models.user_message import UserMessage
from ..models.conversation import Conversation

from ..serializers.user_message_serializer import UserMessageSerializer


class UserMessageListCreateView(ListCreateAPIView):
    queryset = None
    serializer_class = UserMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserMessage.objects.filter(
            conversation__user=self.request.user,
            is_deleted=False,
        )

    def perform_create(self, serializer):
        # Get the file from request.FILES
        image = self.request.FILES.get("image")
        conversation_id = self.request.data.get("conversation")

        # Get the conversation and verify ownership
        conversation = get_object_or_404(
            Conversation, id=conversation_id, user=self.request.user
        )

        # Save with the image if present
        if image:
            serializer.save(conversation=conversation, image=image)
        else:
            serializer.save(conversation=conversation)

    def get(self, request):
        messages = self.get_queryset()
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


class UserMessageDetailView(RetrieveUpdateDestroyAPIView):
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

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        message.soft_delete()  # Use soft delete instead of hard delete
        return Response(status=204)
