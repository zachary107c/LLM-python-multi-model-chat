from django.db import models


class Model(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
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
