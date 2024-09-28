from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Profile
from api.serializers import OllamaModelSerializer

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

        Profile.objects.create(user=user).save()

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    preferred_model = OllamaModelSerializer(read_only=True)
    image = serializers.ImageField()

    class Meta:
        model = Profile
        fields = ("image", "bio", "preferred_model")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        # Modify image URL to include /api/v1 prefix if image exists
        if instance.image:
            image_url = request.build_absolute_uri(instance.image.url)
            representation['image'] = image_url.replace("/media/", "/api/v1/media/")
        
        return representation

    def update(self, instance, validated_data):
        instance.image = validated_data.get("image", instance.image)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.preferred_model = validated_data.get(
            "preferred_model", instance.preferred_model
        )
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


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source="userprofile", many=False)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "profile")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("userprofile", None)
        if profile_data:
            userprofile_instance = instance.userprofile
            userprofile_serializer = self.fields["profile"]
            userprofile_serializer.update(userprofile_instance, profile_data)

        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)

        instance.save()

        return instance
