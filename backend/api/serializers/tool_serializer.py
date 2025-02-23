from rest_framework import serializers

from ..models.tool import Tool

class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = "__all__"
        read_only_fields = ["id", "user", "created_at", "updated_at"]