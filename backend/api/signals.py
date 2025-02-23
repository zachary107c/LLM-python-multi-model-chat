import os
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models.user_message import UserMessage


@receiver(post_delete, sender=UserMessage)
def delete_associated_image(sender, instance, **kwargs):
    if instance.image:
        image_path = instance.image.path
        if os.path.isfile(image_path):
            os.remove(image_path)
            