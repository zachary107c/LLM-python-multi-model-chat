import os
import importlib.util
import inspect
import asyncio
from typing import Callable, Dict, Any

class ToolManager:
    def __init__(self, tools_dir: str = "tools"):
        self.tools_dir = tools_dir
        self.tools = {}

    def load_tools(self):
        """Dynamically loads all tools from the tools directory."""
        for file_name in os.listdir(self.tools_dir):
            if file_name.endswith(".py"):
                module_name = file_name[:-3]
                module_path = os.path.join(self.tools_dir, file_name)
                self._load_tool(module_name, module_path)

    def _load_tool(self, module_name: str, module_path: str):
        """Loads a single tool module."""
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Find all callable functions in the module
        for name, func in inspect.getmembers(module, inspect.isfunction):
            if self._is_valid_tool(func):
                self.tools[name] = func

    def _is_valid_tool(self, func: Callable) -> bool:
        """Validates if a function is a valid tool."""
        # Ensure the function has type annotations and a docstring
        return bool(func.__annotations__) and bool(func.__doc__)

    def is_async(self, func: Callable) -> bool:
        """Determines if a function is asynchronous."""
        return inspect.iscoroutinefunction(func)

    def get_tools(self) -> Dict[str, Callable]:
        """Returns the loaded tools."""
        return self.tools

    async def run_tool(self, tool_name: str, **kwargs) -> Any:
        """
        Executes a tool by name, handling async or sync calls.

        Args:
            tool_name (str): The name of the tool to run.
            kwargs: Arguments to pass to the tool.

        Returns:
            Any: The result of the tool execution.
        """
        tool = self.tools.get(tool_name)
        if not tool:
            raise ValueError(f"Tool '{tool_name}' not found.")

        if self.is_async(tool):
            return await tool(**kwargs)
        return tool(**kwargs)
