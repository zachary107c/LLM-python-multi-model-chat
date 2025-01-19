from rest_framework import serializers

class MessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    content = serializers.CharField()
    created_at = serializers.DateTimeField()
    type = serializers.CharField()
    model = serializers.CharField(required=False)  # Only for AssistantMessage
    provider = serializers.CharField(required=False)  # Only for AssistantMessage