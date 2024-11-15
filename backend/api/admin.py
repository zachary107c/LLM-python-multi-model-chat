from django.contrib import admin
from .models import Conversation, UserMessage, AssistantMessage, Model, ContentVariation

# Register in the admin site
admin.site.register(AssistantMessage)
admin.site.register(Conversation)
admin.site.register(UserMessage)
admin.site.register(Model)
admin.site.register(ContentVariation)
