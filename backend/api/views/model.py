import json
import requests
from io import StringIO
from django.core.management import call_command

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView

from ..models.model import Model

from ..serializers.model_serializer import ModelSerializer

from ..services.llm_service_factory import LLMServiceFactory


class ModelListCreateView(ListCreateAPIView):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer
    permission_classes = [IsAuthenticated]


class ModelDetailWithInfoView(APIView):

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.ollama_service = LLMServiceFactory.get_service("ollama")

    # Fetch and combine model data and Ollama details (GET)
    def get(self, request, pk):
        try:
            # Fetch model from the database using the primary key (pk)
            model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(model)
            if model.provider == "ollama":
                # Query the Ollama API for additional details
                model_info = self.ollama_service.get_model(serializer.data["name"]).dict()
                if model_info:
                    # Remove unnecessary fields from the Ollama response
                    del model_info["details"]
                    del model_info["modelinfo"]

                    # Combine the database model data with the Ollama service response
                    combined_data = {
                        **serializer.data,  # The serialized model data from the database
                        "details": model_info,  # The extra details fetched from Ollama
                    }

                    return Response(combined_data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"error": "Failed to fetch response from Ollama API."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                combined_data = {
                    **serializer.data,
                    "details": {},  # If the model is not from Ollama, just return an empty details field
                }
                return Response(combined_data, status=status.HTTP_200_OK)
        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except requests.exceptions.RequestException as e:
            print(f"requests.exception.RequestException: {e}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"Exception: {e}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Update a model (PUT)
    def put(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            serializer = ModelSerializer(ollama_model, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )

    # Delete a model (DELETE)
    def delete(self, request, pk):
        try:
            ollama_model = Model.objects.get(pk=pk)
            ollama_model.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Model.DoesNotExist:
            return Response(
                {"error": "Model not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ModelsPopulateAPIView(APIView):
    """
    View to handle chat requests with the Ollama API.
    """

    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # self.ollama_service =LLMServiceFactory.get_service("ollama")

    def post(self, request):
        try:
            output = StringIO()
            response = []
            response += json.loads(
                call_command("populate_ollama_models", stdout=output)
            )
            response += json.loads(
                call_command("populate_openai_models", stdout=output)
            )

            return Response(
                {
                    "message": "Successfully re-populated provider models!",
                    "details": output.getvalue(),
                    "data": response,
                },
                status=status.HTTP_200_OK,
            )

        except requests.exceptions.RequestException as e:
            return Response(
                {"error": str(e), "message": "Failed to re-populate provider models!"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
