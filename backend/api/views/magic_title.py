import os
import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from ..services.llm_service_factory import LLMServiceFactory
from ..models.conversation import Conversation
from ..models.user_message import UserMessage
from ..models.assistant_message import AssistantMessage

from ..serializers.assistant_message_serializer import AssistantMessageSerializer
from ..serializers.user_message_serializer import UserMessageSerializer

PROMPTS = {
    "title": "Generate a concise, creative title for the following conversation using the provided summary. Always start and end the title with an emoji. Return only the title, no other text or markdown. Always return text. If there is no conversation, make a random title.",
    "summary": "Create a summary of the following conversation. Return only the summary, no other text or markdown.",
}


class MagicTitleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        model = request.data.get("model")
        provider = request.data.get("provider")
        conversation = request.data.get("conversation")

        if model is None or provider is None or conversation is None:
            return Response(
                {"error": "Model, provider, and count are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not Conversation.objects.filter(user=self.request.user, id=conversation):
            return Response(
                {"error": "Provided Conversation does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        self.llm_service = LLMServiceFactory.get_service(provider)

        if not self.llm_service:
            return Response(
                {"error": f"'{provider}' is an invalid provider."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        assistant_messages = AssistantMessageSerializer(AssistantMessage.objects.filter(
            conversation__id=conversation
        ), many=True).data
        for message in assistant_messages:
            message["type"] = "assistant"

        user_messages = UserMessageSerializer( UserMessage.objects.filter(conversation__id=conversation), many=True).data
        for message in user_messages:
            message["type"] = "user"

        messages = (assistant_messages + user_messages)[-6:]
        messages.sort(key=lambda x: x["created_at"])
        messages_string = ""

        for message in messages:
            if message['type'] == 'assistant':
                messages_string += f"{message['type']}: {message['content_variations'][-1]['content']}\n"
            else:
                messages_string += f"{message['type']}: {message['content']}\n"

        summary_response = self.llm_service.chat(
            model=model,
            messages=[
                {
                    "role": "assistant",
                    "content": PROMPTS.get("summary"),
                },
                {
                    "role": "user",
                    "content": f"MESSAGE HISTORY:\n{messages_string}"
                }
            ],
        )

        if "error" in summary_response:
            return Response(summary_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        summary = summary_response["message"]["content"]

        title_response = self.llm_service.chat(
            model=model,
            messages=[
                {
                    "role": "assistant",
                    "content": PROMPTS.get("title")
                },
                {
                    "role": "user",
                    "content": f"CONVERSATION SUMMARY:\n{summary}"
                }
            ]
        )

        if "error" in title_response:
            return Response(title_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        title = title_response["message"]["content"]

        return Response({"magic_title": title})
    
