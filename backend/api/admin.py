import os
from django.contrib import admin

from .models.model import Model
from .models.tool import Tool
from .models.content_variation import ContentVariation
from .models.user_message import UserMessage
from .models.assistant_message import AssistantMessage
from .models.conversation import Conversation

class ToolAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        # Call the superclass's save_model method to save the tool object to the database
        super().save_model(request, obj, form, change)

        # Define the path where the Python file should be saved
        script_file_path = os.path.join(os.getcwd(), "api", "tools", f"{obj.id}.py")

        # Write the content of the tool's script to the file
        with open(script_file_path, "w") as file:
            file.write(obj.script.replace("\r", ""))

# Register in the admin site
admin.site.register(AssistantMessage)
admin.site.register(Conversation)
admin.site.register(UserMessage)
admin.site.register(Model)
admin.site.register(ContentVariation)
admin.site.register(Tool, ToolAdmin)
