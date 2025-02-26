import json
from django.http import StreamingHttpResponse

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models.tool import Tool
from ..models.conversation import Conversation

from ..serializers.conversation_detail_serializer import ConversationDetailSerializer

from ..services.llm_service_factory import LLMServiceFactory

from users.models.settings import Settings


def map_old_messages(messages):
    new_messages = [
        {
            "role": message["type"],
            "content": (
                message.get("content")
                if message["type"] == "user"
                else message["content_variations"][-1]["content"]
            ),
            "images": [message.get("image")] if message.get("image") else [],
        }
        for message in messages
    ]
    return new_messages


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        try:
            user_settings = Settings.objects.get(user=request.user)
            user_tools = [
                str(tool.id) for tool in Tool.objects.filter(user=request.user)
            ]
            model = request.data.get("model")
            messages = [request.data.get("message")]
            provider = request.data.get("provider")
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("useTools") else False

            if not model or not messages or not provider:
                return Response(
                    {"error": "Model, message, and provider are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if user_settings.use_message_history and conversation_id:
                conversation = Conversation.objects.filter(
                    id=conversation_id, user=request.user
                ).first()

                if not conversation:
                    return Response(
                        {"error": "Conversation not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                messages = (
                    map_old_messages(
                        ConversationDetailSerializer(conversation).data.get(
                            "messages", []
                        )[-user_settings.message_history_count + 1 : -1]
                    )
                    + messages
                )

            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            chat_completion = self.llm_service.chat(
                model=model,
                messages=messages,
                use_tools=use_tools,
                user_tools=user_tools,
            )

            if chat_completion and "error" not in chat_completion:
                return Response(chat_completion, status=status.HTTP_200_OK)
            elif chat_completion and "error" in chat_completion:
                return Response(
                    chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            else:
                return Response(
                    {"error": f"Failed to fetch response from {provider} API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Settings.DoesNotExist:
            return Response(
                {"error": "User settings not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StreamChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        try:
            user_settings = Settings.objects.get(user=request.user)
            user_tools = [
                str(tool.id) for tool in Tool.objects.filter(user=request.user)
            ]
            model = request.data.get("model")
            provider = request.data.get("provider")
            messages = [request.data.get("message")]
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("use_tools") else False

            if not model or not provider or not messages:
                return Response(
                    {"error": "Model, message, and provider are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            self.llm_service = LLMServiceFactory.get_service(provider)

            if user_settings.use_message_history and conversation_id:
                conversation = Conversation.objects.filter(
                    id=conversation_id, user=request.user
                ).first()

                if not conversation:
                    return Response(
                        {"error": "Conversation not found"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                messages = (
                    map_old_messages(
                        ConversationDetailSerializer(conversation).data.get(
                            "messages", []
                        )[-user_settings.message_history_count + 1 : -1]
                    )
                    + messages
                )

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            def stream_response():
                for chunk in self.llm_service.chat_stream(
                    model=model,
                    messages=messages,
                    use_tools=use_tools,
                    user_tools=user_tools,
                ):
                    if chunk and not isinstance(chunk, str):
                        if "error" in chunk:
                            return Response(
                                {"message": chunk},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            )

                        data = f"data: {json.dumps(chunk)}\n\n"
                        yield data.encode("utf-8")

            response = StreamingHttpResponse(
                stream_response(), content_type="text/event-stream"
            )

            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
            response["Access-Control-Allow-Credentials"] = "true"

            return response

        except Settings.DoesNotExist:
            return Response(
                {"error": "User settings not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
