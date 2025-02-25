import os
import re
import json
import requests
from google import genai
from django.core.management.base import BaseCommand
from api.models.model import Model


class Command(BaseCommand):
    help = "Populate Model table with models from Google"

    def handle(self, *args, **kwargs):
        response = []

        if not os.getenv("GEMINI_API_KEY"):
            self.stderr.write(self.style.WARNING("No API key provided. Did you forget to set the GEMINI_API_KEY variable in the .env?"))
            response.append({"message": "No API key provided. Did you forget to set the GEMINI_API_KEY variable in the .env?", "success": False})
            return response

        google_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        try:
            models = google_client.models.list()
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error fetching the model data: {e}"))
            response.append({"message": f"Error fetching the model data: {e}", "success": False})
            return response
        

        for model in models:
            if "legacy" not in model.display_name.lower() and "embedding" not in model.display_name.lower():
                try:
                    _, created = Model.objects.update_or_create(
                        name=model.display_name,
                        model=model.name,
                        color="jade",
                        provider="google",
                        defaults={"name": model.display_name, "model": model.name}
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f"Model '{model.name}' created."))
                        response.append({"message": f"Model '{model.name}' created.", "success": True})
                    else:
                        self.stdout.write(self.style.MIGRATE_HEADING(f"Model '{model.name}' already exists and updated."))
                        response.append({"message": f"Model '{model.name}' already exists and updated.", "success": True})
                except Exception as e:
                   self.stdout.write(self.style.ERROR(f"Failed to add model '{model.name}|{model.display_name}' due to {e}"))
            else:
                self.stdout.write(self.style.ERROR(f"Invalid model data: {model}"))
                response.append({"message": f"Invalid model data: {model}", "success": False})
        return json.dumps(response)
