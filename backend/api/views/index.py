from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


class Index(APIView):
    def get(self, request):
        return Response({"message": "Hello World!"}, status=status.HTTP_200_OK)

    permission_classes = [AllowAny]