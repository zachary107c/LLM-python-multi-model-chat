from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateDestroyAPIView, RetrieveUpdateAPIView

from ..models.profile import Profile
from ..models.settings import Settings

from ..serializers.user_serializer import UserSerializer
from ..serializers.user_profile_serializer import UserProfileSerializer
from ..serializers.user_settings_serializer import UserSettingsSerializer



class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    

class UserProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        # Get the current user's profile
        return get_object_or_404(Profile, user=self.request.user)
    

class UserSettingsView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSettingsSerializer

    def get_object(self):
        # Get the current user's settings
        return get_object_or_404(Settings, user=self.request.user)
