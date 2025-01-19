from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Profile, Settings
from api.models.model import Model
from api.serializers.model_serializer import ModelSerializer
from django.http import HttpRequest


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "password2",
            "email",
            "first_name",
            "last_name",
        )

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return data

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        user.set_password(validated_data["password"])
        user.save()

        return user


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
            print("referer: ", request.headers.get("Referer"))
            print("host: ", request.get_host())
            print("full path: ", request.get_full_path())
            print("port: ", request.get_port())
            print("image_url: ", instance.image.url)
            image_url = request.build_absolute_uri(instance.image.url)
            print("image url: ", image_url)
            representation["image"] = image_url.replace("/media/", "/api/v1/media/")

        return representation

    def update(self, instance, validated_data):
        instance.image = validated_data.get("image", instance.image)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.save()
        return instance


class AuthSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            request=self.context.get("request"), username=username, password=password
        )

        if not user:
            msg = "Unable to authenticate with provided credentials"
            raise serializers.ValidationError(msg, code="authentication")

        attrs["user"] = user
        return


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
