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

from users.models import Settings


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None

    def post(self, request):
        try:
            user_settings = Settings.objects.get(user=request.user)
            user_tools = [str(tool.id) for tool in Tool.objects.filter(user=request.user)]
            model = request.data.get("model")
            messages = request.data.get("messages")
            provider = request.data.get("provider")
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("useTools") else False

            if not model or not messages or not provider:
                return Response(
                    {"error": "Model, messages, and provider are required"},
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

                serializer = ConversationDetailSerializer(conversation)
                serialized_data = serializer.data
                old_messages = serialized_data.get("messages", [])
                old_messages = [message for message in old_messages if not message["is_deleted"]]
                message_history_count = user_settings.message_history_count
                old_messages = old_messages[-message_history_count:-1]
                for idx in range(len(old_messages)):
                    role = old_messages[idx]["type"]
                    if role == "user":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content"],
                        }
                    elif role == "assistant":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content_variations"][-1][
                                "content"
                            ],
                        }
                messages = old_messages + messages
            
            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            chat_completion = self.llm_service.chat(model=model, messages=messages, use_tools=use_tools, user_tools=user_tools)

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
            user_tools = [str(tool.id) for tool in Tool.objects.filter(user=request.user)]
            model = request.data.get("model")
            provider = request.data.get("provider")
            messages = request.data.get("messages")
            conversation_id = request.data.get("conversation")
            use_tools = True if request.data.get("useTools") else False

            if not model or not provider or not messages:
                return Response(
                    {"error": "Model, provider, and messages are required"},
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

                serializer = ConversationDetailSerializer(conversation)
                serialized_data = serializer.data
                old_messages = serialized_data.get("messages", [])
                message_history_count = user_settings.message_history_count
                old_messages = old_messages[-message_history_count:-1]
                for idx in range(len(old_messages)):
                    role = old_messages[idx]["type"]
                    if role == "user":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content"],
                        }
                    elif role == "assistant":
                        old_messages[idx] = {
                            "role": role,
                            "content": old_messages[idx]["content_variations"][-1][
                                "content"
                            ],
                        }
                messages = old_messages + messages

            self.llm_service = LLMServiceFactory.get_service(provider)

            if not self.llm_service:
                return Response(
                    {"error": f"'{provider}' is an invalid provider."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            def stream_response():
                for chunk in self.llm_service.chat_stream(model=model, messages=messages, use_tools=use_tools, user_tools=user_tools):
                    if chunk and not isinstance(chunk, str):
                        if "error" in chunk:
                            return Response(
                                {"message": chunk},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            )
                        if provider == "ollama":
                            data = f"data: {json.dumps(chunk)}\n\n"
                        else:
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

