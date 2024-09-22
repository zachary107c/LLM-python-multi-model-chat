from rest_framework import serializers
from .models import Conversation, UserMessage, AssistantMessage, OllamaModel


class MessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField()
    type = serializers.CharField()
    model = serializers.CharField(required=False)  # Only for AssistantMessage
    provider = serializers.CharField(required=False)  # Only for AssistantMessage


class UserMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMessage
        fields = "__all__"


class AssistantMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistantMessage
        fields = "__all__"


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            "id",
            "title",
            "created_at",
            "updated_at",
            "user",
            "messages",
            "liked",
        )
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_messages(self, obj):
        user_messages = UserMessage.objects.filter(conversation=obj).values(
            "id", "content", "created_at"
        )
        assistant_messages = AssistantMessage.objects.filter(conversation=obj).values(
            "id", "content", "model", "provider", "created_at", "liked"
        )

        user_message_list = [
            {
                "id": um["id"],
                "content": um["content"],
                "created_at": um["created_at"],
                "type": "user",
            }
            for um in user_messages
        ]

        assistant_message_list = [
            {
                "id": am["id"],
                "content": am["content"],
                "created_at": am["created_at"],
                "type": "assistant",
                "model": am["model"],
                "provider": am["provider"],
                "liked": am["liked"]
            }
            for am in assistant_messages
        ]

        merged_messages = user_message_list + assistant_message_list
        merged_messages.sort(key=lambda x: x["created_at"])

        return merged_messages


class OllamaModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = OllamaModel
        fields = "__all__"
