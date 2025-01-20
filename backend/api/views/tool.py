import os

from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models.tool import Tool

from ..serializers.tool_serializer import ToolSerializer


class ToolFileMixin:
    """Mixin to handle saving and deleting script files."""

    def save_script_to_file(self, tool):
        script_file_path = os.path.join(os.getcwd(), "api", "tools", f"{tool.id}.py")
        with open(script_file_path, "w") as file:
            file.write(tool.script.replace("\r", ""))

    def delete_script_file(self, tool):
        script_file_path = os.path.join(os.getcwd(), "api", "tools", f"{tool.id}.py")
        if os.path.exists(script_file_path):
            print(f"Removing tool found on path: {script_file_path}")
            os.remove(script_file_path)
        else:
            print(f"Tried to delete tool {tool.id} but path {script_file_path} did not exist!")


class ToolsListCreateView(ToolFileMixin, ListCreateAPIView):
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tool.objects.filter(user=self.request.user)

    def get(self, request):
        tools = self.get_queryset()
        serializer = self.get_serializer(tools, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        tool = serializer.save(user=self.request.user)
        self.save_script_to_file(tool)


class ToolsDetailView(ToolFileMixin, RetrieveUpdateDestroyAPIView):
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tool.objects.filter(user=self.request.user)

    def get_object(self):
        tool = super().get_object()
        if tool.user != self.request.user:
            raise PermissionDenied("You do not have permission to access this tool.")
        return tool

    def perform_update(self, serializer):
        tool = serializer.save(user=self.request.user)
        self.save_script_to_file(tool)

    def perform_destroy(self, instance):
        print("Attempting to delete the python script associated with the tool.")
        self.delete_script_file(instance)
        super().perform_destroy(instance)