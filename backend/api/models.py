import uuid
from django.db import models
from django.contrib.auth.models import User


class Model(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=False)
    model = models.CharField(max_length=255, unique=False)
    liked = models.BooleanField(default=False)
    provider = models.CharField(max_length=255, unique=False)
    color = models.CharField(
        max_length=25,
        choices=[
            ("gray", "gray"),
            ("mauve", "mauve"),
            ("slate", "slate"),
            ("sage", "sage"),
            ("olive", "olive"),
            ("sand", "sand"),
            ("tomato", "tomato"),
            ("red", "red"),
            ("ruby", "ruby"),
            ("crimson", "crimson"),
            ("pink", "pink"),
            ("plum", "plum"),
            ("purple", "purple"),
            ("violet", "violet"),
            ("iris", "iris"),
            ("indigo", "indigo"),
            ("blue", "blue"),
            ("cyan", "cyan"),
            ("teal", "teal"),
            ("jade", "jade"),
            ("green", "green"),
            ("grass", "grass"),
            ("bronze", "bronze"),
            ("gold", "gold"),
            ("brown", "brown"),
            ("orange", "orange"),
            ("amber", "amber"),
            ("yellow", "yellow"),
            ("lime", "lime"),
            ("mint", "mint"),
            ("sky", "sky"),
        ],
        default="Gray",
    )

    def __str__(self):
        return self.name


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(
        User, related_name="conversations", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    liked = models.BooleanField(default=False)

    def __str__(self):
        return f"Conversation {self.id} - {self.title}"


class UserMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="user_message_images/", null=True, blank=True, max_length=255)

    def __str__(self):
        return f"User Message {self.id} - {self.conversation.user.username}"

class ContentVariation(models.Model):
    # Model to store different content versions
    id = models.AutoField(primary_key=True)
    content = models.TextField()

    def __str__(self):
        return f"Content Variation {self.id}"

class AssistantMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content_variations = models.ManyToManyField(ContentVariation)
    generated_by = models.ForeignKey(UserMessage, on_delete=models.DO_NOTHING)
    model = models.ForeignKey(Model, on_delete=models.DO_NOTHING)
    provider = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    liked = models.BooleanField(default=False)

    def __str__(self):
        return f"Assistant Message {self.id} - {self.model}"
