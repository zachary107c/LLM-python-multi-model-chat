from datetime import datetime, timedelta
from django.conf import settings
import pytz
from rest_framework import serializers
from .models import Conversation, UserMessage, AssistantMessage, Model, ContentVariation


class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = "__all__"
        read_only_fields = ["id", "name", "model"]


class MessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField()
    type = serializers.CharField()
    model = serializers.CharField(required=False)  # Only for AssistantMessage
    provider = serializers.CharField(required=False)  # Only for AssistantMessage


class UserMessageSerializer(serializers.ModelSerializer):
    recoverable = serializers.SerializerMethodField()

    class Meta:
        model = UserMessage
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if representation.get("image"):
            request = self.context.get("request")
            if request:
                image_url = request.build_absolute_uri(representation["image"])
                representation["image"] = image_url.replace("/media/", "/api/v1/media/")

        return representation

    def get_recoverable(self, obj):
        return obj.recoverable


class ContentVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentVariation
        fields = ["id", "content"]


class AssistantMessageSerializer(serializers.ModelSerializer):
    recoverable = serializers.SerializerMethodField()
    model = serializers.PrimaryKeyRelatedField(queryset=Model.objects.all())
    content_variations = ContentVariationSerializer(many=True)
    generated_by = UserMessageSerializer()

    class Meta:
        model = AssistantMessage
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["model"] = ModelSerializer(instance.model).data
        representation["type"] = "assistant"
        return representation

    def get_recoverable(self, obj):
        return obj.recoverable


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
        user_messages = UserMessage.objects.filter(conversation=obj)
        user_message_list = UserMessageSerializer(user_messages, many=True).data
        for message in user_message_list:
            message["type"] = "user"
            message["image"] = (
                self.build_full_image_url(message["image"])
                if message["image"]
                else None
            )
            if message["is_deleted"]:
                if message["recoverable"]:
                    deleted_time = datetime.strptime(message["deleted_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
                    deleted_time = deleted_time.replace(tzinfo=pytz.utc)
                    expiration_time = deleted_time + timedelta(hours=settings.RECOVERY_HOURS or 24)
                    current_time = datetime.now(pytz.utc)
                    remaining_time = expiration_time - current_time
                    if remaining_time.total_seconds() > 0:
                        hours, remainder = divmod(int(remaining_time.total_seconds()), 3600)
                        message["time_remaining"] = f"{hours} more hour{'s' if hours > 1 else ''}"
                    else: 
                        message["time_remaining"] = "0 more hours"
                    deleted_time_iso = deleted_time.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
                    message["content"] = (
                        f"*This message was deleted on {deleted_time_iso} and will be recoverable for {message['time_remaining']}.*"
                        if remaining_time.total_seconds() > 0 else
                        "*This message was deleted and is no longer recoverable.*"
                    )
                    message["image"] = None
                else:
                    deleted_time = datetime.strptime(message["deleted_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
                    deleted_time_iso = deleted_time.replace(tzinfo=pytz.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
                    message["content"] = f"*This message was deleted on {deleted_time_iso} and is no longer recoverable.*"
                    message["image"] = None

        assistant_messages = AssistantMessage.objects.filter(conversation=obj)
        assistant_message_list = AssistantMessageSerializer(
            assistant_messages, many=True
        ).data
        for message in assistant_message_list:
            message["type"] = "assistant"
            if message["generated_by"]["image"]:
                message["generated_by"]["image"] = self.build_full_image_url(
                    message["generated_by"]["image"]
                )
            if message["is_deleted"]:
                if message["recoverable"]:
                    deleted_time = datetime.strptime(message["deleted_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
                    deleted_time = deleted_time.replace(tzinfo=pytz.utc)
                    expiration_time = deleted_time + timedelta(hours=settings.RECOVERY_HOURS or 24)
                    current_time = datetime.now(pytz.utc)
                    remaining_time = expiration_time - current_time
                    if remaining_time.total_seconds() > 0:
                        hours, remainder = divmod(int(remaining_time.total_seconds()), 3600)
                        message["time_remaining"] = f"{hours} more hour{'s' if hours > 1 else ''}"
                    else: 
                        message["time_remaining"] = "0 more hours"
                    deleted_time_iso = deleted_time.isoformat(timespec='milliseconds').replace('+00:00', 'Z')
                    message["content_variations"] = [{"id": -1, "content": (
                        f"*This message was deleted on {deleted_time_iso} and will be recoverable for {message['time_remaining']}.*"
                        if remaining_time.total_seconds() > 0 else
                        "*This message was deleted and is no longer recoverable.*"
                    )}]
                    message["image"] = None
                else:
                    deleted_time = datetime.strptime(message["deleted_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
                    deleted_time_iso = deleted_time.replace(tzinfo=pytz.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
                    message["content_variations"] = [{"id": -1, "content": f"*This message was deleted on {deleted_time_iso} and is no longer recoverable.*"}]
                    message["image"] = None

        merged_messages = user_message_list + assistant_message_list
        merged_messages.sort(key=lambda x: x["created_at"])

        return merged_messages

    def build_full_image_url(self, image_path):
        request = self.context.get("request")
        if image_path and request:
            return request.build_absolute_uri(image_path).replace(
                "/media/", "/api/v1/media/"
            )
        return None
