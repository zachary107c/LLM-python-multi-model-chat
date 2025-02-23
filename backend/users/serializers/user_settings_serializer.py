from rest_framework import serializers

from ..models.settings import Settings

from api.models.model import Model
from api.serializers.model_serializer import ModelSerializer


class UserSettingsSerializer(serializers.ModelSerializer):
    preferred_model = serializers.PrimaryKeyRelatedField(
        queryset=Model.objects.all(), required=False
    )

    class Meta:
        model = Settings
        fields = ("preferred_model", "stream_responses", "theme", "use_message_history", "message_history_count", "use_tools")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Use ModelSerializer to expand preferred_model into detailed info
        if instance.preferred_model:
            model_serializer = ModelSerializer(instance.preferred_model)
            representation["preferred_model"] = model_serializer.data
        return representation

    def update(self, instance, validated_data):
        preferred_model_id = validated_data.get("preferred_model")
        if preferred_model_id is not None:
            instance.preferred_model = preferred_model_id

        instance.stream_responses = validated_data.get(
            "stream_responses", instance.stream_responses
        )
        instance.theme = validated_data.get("theme", instance.theme)
        instance.use_message_history = validated_data.get("use_message_history", instance.use_message_history)
        instance.message_history_count = validated_data.get("message_history_count", instance.message_history_count)
        instance.use_tools = validated_data.get("use_tools", instance.use_tools)
        instance.save()
        return instance
