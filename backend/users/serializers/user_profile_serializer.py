from django.http import HttpRequest

from rest_framework import serializers

from ..models.profile import Profile


class UserProfileSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = Profile
        fields = ("image", "bio")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request: HttpRequest = self.context.get("request")

        # Modify image URL to include /api/v1 prefix if image exists
        if instance.image:
            image_url = request.build_absolute_uri(instance.image.url)
            representation["image"] = image_url.replace("/media/", "/api/v1/media/")

        return representation

    def update(self, instance, validated_data):
        instance.image = validated_data.get("image", instance.image)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.save()
        return instance

