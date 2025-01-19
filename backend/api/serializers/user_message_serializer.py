from rest_framework import serializers

from ..models.user_message import UserMessage

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