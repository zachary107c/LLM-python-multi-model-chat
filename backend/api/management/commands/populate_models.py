from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = "Run the populate commands for each of the LLM providers."

    def handle(self, *args, **kwargs):
        commands = [
            "populate_ollama_models",
            "populate_openai_models",
            "populate_anthropic_models",
            "populate_google_models",
        ]

        for command in commands:
            self.stdout.write(self.style.SUCCESS(f"Running command: {command}"))
            call_command(*command.split())
            self.stdout.write(self.style.SUCCESS(f"Completed: {command}"))
