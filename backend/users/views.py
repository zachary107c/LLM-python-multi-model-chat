from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.authtoken.serializers import AuthTokenSerializer
from .serializers import RegisterSerializer, UserSerializer, AuthSerializer
from django.contrib.auth.models import User
from knox.views import (
    LoginView as KnoxLoginView,
    LogoutView as KnoxLogoutView,
    LogoutAllView as KnoxLogoutAllView,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        login(request, user)

        return Response(
            {"message": "User registered and logged in successfully"},
            status=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        return serializer.save()


class LoginView(KnoxLoginView):
    serializer_class = AuthSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response(
            {"message": "Logged out successfully"}, status=status.HTTP_200_OK
        )


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
