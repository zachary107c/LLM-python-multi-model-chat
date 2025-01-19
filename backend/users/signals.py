import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile, Settings

from api.models.model import Model

@receiver(post_save, sender=User)
def create_related_objects(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        available_models = list(Model.objects.all())
        preferred_model = random.choice(available_models) if available_models else None
        Settings.objects.create(user=instance, preferred_model=preferred_model)
