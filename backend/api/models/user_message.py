from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings

from .conversation import Conversation

class UserMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(
        upload_to="user_message_images/", null=True, blank=True, max_length=255
    )
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

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
        return f"User Message {self.id} - {self.conversation.user.username}"
