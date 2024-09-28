import requests
from django.core.management.base import BaseCommand
from api.models import OllamaModel


class Command(BaseCommand):
    help = "Populate OllamaModel table with models from Ollama API"

    def handle(self, *args, **kwargs):
        api_url = "http://127.0.0.1:11434/api/tags"

        try:
            response = requests.get(api_url)
            response.raise_for_status()
        except requests.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Error fetching the API data: {e}"))
            return

        data = response.json()

        for model_data in data.get("models", []):
            name = model_data.get("name")
            model = model_data.get("model")

            if name and model:
                ollama_model, created = OllamaModel.objects.update_or_create(
                    name=name,
                    model=model,
                    defaults={"name": name, "model": model}
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f"Model '{name}' created."))
                else:
                    self.stdout.write(self.style.MIGRATE_HEADING(f"Model '{name}' already exists and updated."))
            else:
                self.stdout.write(self.style.ERROR(f"Invalid model data: {model_data}"))
