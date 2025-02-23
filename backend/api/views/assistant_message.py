from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models.assistant_message import AssistantMessage
from ..models.content_variation import ContentVariation
from ..models.user_message import UserMessage
from ..models.conversation import Conversation
from ..models.model import Model

from ..serializers.assistant_message_serializer import AssistantMessageSerializer


class AssistantMessageListCreateView(ListCreateAPIView):
    queryset = None
    serializer_class = AssistantMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssistantMessage.objects.filter(
            conversation__user=self.request.user, is_delete=False
        )

    def post(self, request, *args, **kwargs):
        # Get the conversation and model from the request
        conversation_id = request.data.get("conversation")
        model_id = request.data.get("model")

        # Retrieve the conversation and model instances
        conversation = Conversation.objects.get(
            id=conversation_id, user=self.request.user
        )
        model = Model.objects.get(id=model_id)

        # Retireve the user message used to generate this assistant message
        user_message = UserMessage.objects.get(id=request.data.get("generated_by"))

        # Create an AssistantMessage instance without committing to the database
        assistant_message = AssistantMessage(
            conversation=conversation,
            model=model,
            provider=request.data.get("provider"),
            liked=request.data.get("liked", False),
            generated_by=user_message,
            tools_used=request.data.get("tools_used", [])
        )

        assistant_message.save()  # Save the AssistantMessage to generate an ID

        content_variations_data = request.data.get("content_variations", [])
        for content in content_variations_data:
            # Create a new ContentVariation instance
            content_variation = ContentVariation.objects.create(content=content)
            # Associate it with the AssistantMessage
            assistant_message.content_variations.add(content_variation)

        serializer = self.get_serializer(assistant_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AssistantMessageDetailView(RetrieveUpdateDestroyAPIView):
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

        # Add single content variation if provided
        new_content = request.data.get("new_content_variation", None)
        if new_content:
            content_variation = ContentVariation.objects.create(content=new_content)
            instance.content_variations.add(content_variation)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        message = self.get_object()
        message.soft_delete()  # Use soft delete instead of hard delete
        return Response(status=204)