import os
import json
from django.core.management.base import BaseCommand
from django.utils import timezone

class Command(BaseCommand):
    help = "Populate Model table with models from Ollama"

    def handle(self, *args, **kwargs):
        # Load the fixture
        with open(
            os.path.join(os.getcwd(), "api", "fixtures", "tools_fixture.json"),
            "r",
        ) as file:
            data = json.load(file)

        # Get the current time in UTC
        now = timezone.now().astimezone(timezone.utc)

        # Update each entry with current timestamps in UTC
        for entry in data:
            entry["fields"]["created_at"] = now.isoformat()
            entry["fields"]["updated_at"] = now.isoformat()

        # Save the updated fixture
        with open(
            os.path.join(os.getcwd(), "api", "fixtures", "tools_fixture.json"),
            "w",
        ) as file:
            json.dump(data, file, indent=4)