from django.contrib.auth import login

from rest_framework.permissions import AllowAny
from rest_framework.authtoken.serializers import AuthTokenSerializer

from knox.views import LoginView as KnoxLoginView

from ..serializers.auth_serializer import AuthSerializer


class LoginView(KnoxLoginView):
    serializer_class = AuthSerializer
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)
