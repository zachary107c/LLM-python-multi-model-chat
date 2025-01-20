import os
import json

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from ..services.llm_service_factory import LLMServiceFactory

PROMPTS = {
    "three_suggestions": open(
        os.path.join(os.getcwd(), "api", "prompts", "three_suggestions.txt")
    ).read()
}


class ThreeSuggestionsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.llm_service = None
        self.buckets = [
            "Programming Questions",
            "Fun Facts",
            "General Knowledge",
            "Story Creation",
            "Jokes and Humor",
            "Career Advice",
            "Language Learning",
            "Scientific Explanations",
            "Mental Health & Wellness",
            "Creative Writing",
            "DIY & Home Projects",
            "Music & Art",
            "Historical Events",
            "Travel Tips",
            "Technology Trends",
            "Life Skills",
        ]

    def post(self, request):
        model = request.data.get("model")
        provider = request.data.get("provider")
        count = request.data.get("count")

        if model is None or provider is None or count is None:
            return Response(
                {"error": "Model, provider, and count are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(count, int):
            return Response(
                {"error": "Parameter count must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        base_prompt = PROMPTS.get("three_suggestions")

        self.llm_service = LLMServiceFactory.get_service(provider)

        if not self.llm_service:
            return Response(
                {"error": f"'{provider}' is an invalid provider."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        suggestions = []
        available_buckets = self.buckets[:]
        used_buckets = []

        for _ in range(count):
            try:
                prompt = base_prompt.replace(
                    "${buckets}", "- " + "\n- ".join(available_buckets) + "\n"
                ).replace(
                    "${suggestions}",
                    (
                        "\n- "
                        + "\n- ".join(
                            [suggestion["summary"] for suggestion in suggestions]
                        )
                        if suggestions
                        else "No suggetions generated yet"
                    ),
                )

                chat_completion = self.llm_service.chat(
                    model=model, messages=[{"role": "user", "content": prompt}]
                )

                suggestion = json.loads(
                    chat_completion["message"]["content"]
                    .replace("```json", "")
                    .replace("```", "")
                )

                if (
                    "bucket" in suggestion
                    and "summary" in suggestion
                    and "question" in suggestion
                ):
                    suggestions.append(suggestion)
            except Exception as e:
                print(f"three suggestions error: {e}")

        try:
            payload = {"suggestions": suggestions}
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            chat_completion["external_message"] = f"Failed to decode the json -> {e}"
            return Response(
                chat_completion, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

