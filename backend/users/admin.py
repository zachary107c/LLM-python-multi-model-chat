from django.contrib import admin

from .models.profile import Profile
from .models.settings import Settings
from .models.custom_user import CustomUser

admin.site.register(Profile)
admin.site.register(Settings)
admin.site.register(CustomUser)
