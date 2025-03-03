from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings

from .model import Model
from .conversation import Conversation
from .content_variation import ContentVariation
from .user_message import UserMessage


class AssistantMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content_variations = models.ManyToManyField(ContentVariation)
    generated_by = models.ForeignKey(UserMessage, on_delete=models.DO_NOTHING)
    model = models.ForeignKey(Model, on_delete=models.SET_NULL, null=True)
    provider = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    liked = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    tools_used = models.JSONField(null=True, default=None)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def recover(self):
        if self.is_deleted and self.recoverable:
            self.is_deleted = False
            self.deleted_at = None
            self.save()

    @property
    def recoverable(self):
        if not self.is_deleted:
            return False
        if self.deleted_at is None:
            return False
        time_since_deletion = timezone.now() - self.deleted_at
        return time_since_deletion < timedelta(hours=settings.RECOVERY_HOURS or 24)

    def __str__(self):
        return f"Assistant Message {self.id} - {self.model}"
