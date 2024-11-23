import os
import json
import requests
from django.core.management.base import BaseCommand
from api.models import Model


class Command(BaseCommand):
    help = "Populate Model table with models from Ollama"

    def handle(self, *args, **kwargs):
        responses = []

        ollama_endpoint = os.getenv("OLLAMA_ENDPOINT")

        if not ollama_endpoint:
            self.stderr.write(self.style.WARNING("No ollama endpoint provided. Did you forget to set the OLLAMA_ENDPOINT variable in the .env?"))
            responses.append({"message": "No ollama endpoint provided. Did you forget to set the OLLAMA_ENDPOINT variable in the .env?", "success": False})
            return responses

        api_url = f"{ollama_endpoint}/api/tags"

        try:
            response = requests.get(api_url)
            response.raise_for_status()
        except requests.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Error fetching the API data: {e}"))
            responses.append({"message": f"Error fetching the API data: {e}", "success": False})
            return responses

        data = response.json()

        for model_data in data.get("models", []):
            name = model_data.get("name")
            model = model_data.get("model")

            if name and model:
                _, created = Model.objects.update_or_create(
                    name=name,
                    model=model,
                    provider="ollama",
                    defaults={"name": name, "model": model}
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Model '{name}' created."))
                    responses.append({"message": f"Model '{name}' created.", "success": True})
                else:
                    self.stdout.write(self.style.MIGRATE_HEADING(f"Model '{name}' already exists and updated."))
                    responses.append({"message": f"Model '{name}' already exists and updated.", "success": True})
            else:
                self.stdout.write(self.style.ERROR(f"Invalid model data: {model_data}"))
                responses.append({"message": f"Invalid model data: {model_data}", "success": False})
        return json.dumps(responses)
