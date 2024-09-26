from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import User
from PIL import Image
from api.models import OllamaModel


class Profile(models.Model):
    user = models.OneToOneField(User, related_name="userprofile", on_delete=models.CASCADE)
    image = models.ImageField(default="profile_pics/default/default.jpg", upload_to="profile_pics/")
    bio = models.TextField(null=True, blank=True)
    preferred_model = models.ForeignKey(OllamaModel, related_name="preferred_model", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)


class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
