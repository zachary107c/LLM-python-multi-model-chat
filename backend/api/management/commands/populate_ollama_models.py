import os
import json
import random
import requests
from django.core.management.base import BaseCommand
from api.models import Model

COLORS = ["gray", "gold", "bronze", "brown", "yellow", "amber", "orange", "tomato", "red", "ruby", "crimson", "pink", "plum", "purple", "violet", "iris", "indigo", "blue", "cyan", "teal", "jade", "green", "grass", "lime", "mint", "sky"]

class Command(BaseCommand):
    help = "Populate Model table with models from Ollama"

    def handle(self, *args, **kwargs):
        responses = []

        OLLAMA_HOST = os.getenv("OLLAMA_HOST")

        print(OLLAMA_HOST)

        if not OLLAMA_HOST:
            self.stderr.write(self.style.WARNING("No ollama endpoint provided. Did you forget to set the OLLAMA_HOST variable in the .env?"))
            responses.append({"message": "No ollama endpoint provided. Did you forget to set the OLLAMA_HOST variable in the .env?", "success": False})
            return responses

        api_url = f"{OLLAMA_HOST}/api/tags"

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
                obj, created = Model.objects.update_or_create(
                    name=name,
                    defaults={
                        "model": model,
                        "provider": "ollama",
                        "color": random.choice(COLORS),
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Model '{name}' created."))
                    responses.append({"message": f"Model '{name}' created.", "success": True})
                else:
                    self.stdout.write(self.style.NOTICE(f"Model '{name}' already exists and updated."))
                    responses.append({"message": f"Model '{name}' already exists and updated.", "success": True})
            else:
                self.stdout.write(self.style.ERROR(f"Invalid model data: {model_data}"))
                responses.append({"message": f"Invalid model data: {model_data}", "success": False})

        return json.dumps(responses)