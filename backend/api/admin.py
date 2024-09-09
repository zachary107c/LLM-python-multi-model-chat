from django.contrib import admin
from .models import Conversation, UserMessage, AssistantMessage, OllamaModel

admin.site.register(Conversation)
admin.site.register(UserMessage)
admin.site.register(AssistantMessage)
admin.site.register(OllamaModel)
