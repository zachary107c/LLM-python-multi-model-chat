import os
import json
import datetime
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Populate Model table with models from Ollama"

    def handle(self, *args, **kwargs):
        # Load the fixture
        with open(
            os.path.join(os.getcwd(), "api", "fixtures", "tools_fixture.json"),
            "r",
        ) as file:
            data = json.load(file)

        # Update each entry with current timestamps
        for entry in data:
            entry["fields"]["created_at"] = datetime.datetime.now().isoformat()
            entry["fields"]["updated_at"] = datetime.datetime.now().isoformat()

        # Save the updated fixture
        with open(
            os.path.join(os.getcwd(), "api", "fixtures", "tools_fixture.json"),
            "w",
        ) as file:
            json.dump(data, file, indent=4)