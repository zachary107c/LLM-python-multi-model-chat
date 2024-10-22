from django.conf import settings
from rest_framework import serializers
from .models import Conversation, UserMessage, AssistantMessage, Model


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
    class Meta:
        model = UserMessage
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        representation["type"] = "user"
        if request and instance.image:
            print(instance.image.url)
            image_url = request.build_absolute_uri(instance.image.url)
            representation["image"] = image_url.replace("/media/", "/api/v1/media/")
        return representation


class AssistantMessageSerializer(serializers.ModelSerializer):
    model = serializers.PrimaryKeyRelatedField(queryset=Model.objects.all())

    class Meta:
        model = AssistantMessage
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["model"] = ModelSerializer(instance.model).data
        representation["type"] = "assistant"
        return representation


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
            message["image"] = self.build_full_image_url(message["image"]) if message["image"] else None

        assistant_messages = AssistantMessage.objects.filter(conversation=obj)
        assistant_message_list = AssistantMessageSerializer(assistant_messages, many=True).data
        for message in assistant_message_list:
            message["type"] = "assistant"

        merged_messages = user_message_list + assistant_message_list
        merged_messages.sort(key=lambda x: x["created_at"])

        return merged_messages

    def build_full_image_url(self, image_path):
        request = self.context.get("request")
        if image_path and request:
            # return request.build_absolute_uri(f"{settings.MEDIA_URL}{image_path}")
            return request.build_absolute_uri(image_path).replace("/media/", "/api/v1/media/")
        return None
