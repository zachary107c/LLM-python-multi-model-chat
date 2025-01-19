from django.db import models


class ContentVariation(models.Model):
    # Model to store different content versions
    id = models.AutoField(primary_key=True)
    content = models.TextField()

    def __str__(self):
        return f"Content Variation {self.id}"
