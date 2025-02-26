import os
import re
import json
import anthropic
import requests
from django.core.management.base import BaseCommand
from api.models.model import Model


class Command(BaseCommand):
    help = "Populate Model table with models from Anthropic"

    def handle(self, *args, **kwargs):
        response = []

        if not os.getenv("ANTHROPIC_API_KEY"):
            self.stderr.write(self.style.WARNING("No API key provided. Did you forget to set the ANTHROPIC_API_KEY variable in the .env?"))
            response.append({"message": "No API key provided. Did you forget to set the ANTHROPIC_API_KEY variable in the .env?", "success": False})
            return response

        anthropic_client = anthropic.Anthropic()

        try:
            models = anthropic_client.models.list()
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error fetching the model data: {e}"))
            response.append({"message": f"Error fetching the model data: {e}", "success": False})
            return response
        

        for model in models.data:
            if "claude" in model.id and "audio" not in model.id and "realtime" not in model.id:
                _, created = Model.objects.update_or_create(
                    name=model.display_name,
                    model=model.id,
                    color="jade",
                    provider="anthropic",
                    defaults={"name": model.display_name, "model": model.id}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Model '{model.id} ({model.display_name})' created."))
                    response.append({"message": f"Model '{model.id} ({model.display_name})' created.", "success": True})
                else:
                    self.stdout.write(self.style.MIGRATE_HEADING(f"Model '{model.id} ({model.display_name})' already exists and updated."))
                    response.append({"message": f"Model '{model.id} ({model.display_name})' already exists and updated.", "success": True})
            else:
                self.stdout.write(self.style.ERROR(f"Invalid model data: {model}"))
                response.append({"message": f"Invalid model data: {model}", "success": False})
        return json.dumps(response)
