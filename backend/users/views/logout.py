from django.contrib.auth import logout

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        logout(request)
        return Response(
            {"message": "Logged out successfully"}, status=status.HTTP_200_OK
        )
