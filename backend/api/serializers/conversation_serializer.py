from rest_framework import serializers

from ..models.conversation import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at", "updated_at"]