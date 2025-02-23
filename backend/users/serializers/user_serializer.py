from django.contrib.auth.models import User

from rest_framework import serializers

from .user_profile_serializer import UserProfileSerializer
from .user_settings_serializer import UserSettingsSerializer


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source="userprofile", many=False)
    settings = UserSettingsSerializer(source="usersettings", many=False)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "profile", "settings")

    def update(self, instance, validated_data):
        # Update profile
        profile_data = validated_data.pop("userprofile", None)
        if profile_data:
            userprofile_instance = instance.userprofile
            userprofile_serializer = self.fields["profile"]
            userprofile_serializer.update(userprofile_instance, profile_data)

        # Update settings
        settings_data = validated_data.pop("usersettings", None)
        if settings_data:
            usersettings_instance = instance.usersettings
            usersettings_serializer = self.fields["settings"]
            usersettings_serializer.update(usersettings_instance, settings_data)

        # Update other User fields
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)

        instance.save()

        return instance
