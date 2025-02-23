import uuid
from django.db import models
from django.contrib.auth.models import User


class Tool(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    user = models.ForeignKey(User, related_name="tools", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True, default="")
    script = models.TextField(blank=True, default="")

    def __str__(self):
        return self.name
