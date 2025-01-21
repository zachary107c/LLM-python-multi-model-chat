from django.contrib.auth import login
from django.contrib.auth.models import User

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from ..serializers.register_serializer import RegisterSerializer


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
