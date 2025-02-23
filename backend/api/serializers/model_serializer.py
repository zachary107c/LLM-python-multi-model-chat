from rest_framework import serializers

from ..models.model import Model

class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = "__all__"
        read_only_fields = ["id", "name", "model"]