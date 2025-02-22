from django.core.management.base import BaseCommand
from api.models.tool import Tool

class Command(BaseCommand):
    help = "Resave all Tool objects to ensure script files are generated"

    def handle(self, *args, **kwargs):
        for tool in Tool.objects.all():
            tool.save()
        self.stdout.write(self.style.SUCCESS("Successfully resaved all Tool objects"))
        
