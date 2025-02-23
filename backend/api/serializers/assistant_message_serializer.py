from rest_framework import serializers

from ..models.model import Model
from ..models.assistant_message import AssistantMessage
from .content_variation_serializer import ContentVariationSerializer
from .user_message_serializer import UserMessageSerializer
from .model_serializer import ModelSerializer

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