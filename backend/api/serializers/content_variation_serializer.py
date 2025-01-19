from rest_framework import serializers

from ..models.content_variation import ContentVariation

class ContentVariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentVariation
        fields = ["id", "content"]