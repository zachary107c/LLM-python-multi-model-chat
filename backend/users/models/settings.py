from django.db import models
from django.contrib.auth.models import User
from api.models.model import Model


class Settings(models.Model):
    class Meta:
        verbose_name = "Setting"
        verbose_name_plural = "Settings"

    class ThemeChoices(models.TextChoices):
        LIGHT = "light", "Light"
        DARK = "dark", "Dark"

    user = models.OneToOneField(
        User, related_name="usersettings", on_delete=models.CASCADE
    )
    preferred_model = models.ForeignKey(
        Model,
        related_name="preferred_model",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    stream_responses = models.BooleanField(default=False)
    theme = models.CharField(
        max_length=5,
        choices=ThemeChoices.choices,
        default=ThemeChoices.LIGHT,
    )
    use_message_history = models.BooleanField(default=True)
    message_history_count = models.IntegerField(default=5)
    use_tools = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.user.username}"
