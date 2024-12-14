import os
import importlib.util
import inspect
import asyncio
from typing import Callable, Dict, Any, List


class ToolManager:
    def __init__(self, tools_dir: str):
        self.tools_dir = tools_dir
        self.tools = {}

    def load_tools(self, valid_tools: List[str] = None):
        """Dynamically loads all tools from the tools directory."""
        for file_name in os.listdir(self.tools_dir):
            if file_name.endswith(".py"):
                module_name = file_name[:-3]
                if module_name in valid_tools:
                    try:
                        module_path = os.path.join(self.tools_dir, file_name)
                        self._load_tool(module_name, module_path)
                    except Exception as e:
                        print(f"Failed to load tool!: {e}")

    def _load_tool(self, module_name: str, module_path: str):
        """Loads a single tool module."""
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        # Find all callable functions in the module
        for name, func in inspect.getmembers(module, inspect.isfunction):
            if self._is_valid_tool(func):
                self.tools[name] = {"id": module_name, "function": func}


    def _is_valid_tool(self, func: Callable) -> bool:
        """Validates if a function is a valid tool."""
        # Ensure the function has type annotations and a docstring
        return bool(func.__annotations__) and bool(func.__doc__)

    def is_async(self, func: Callable) -> bool:
        """Determines if a function is asynchronous."""
        return inspect.iscoroutinefunction(func)

    def get_tools(self, user_tool_ids) -> Dict[str, Callable]:
        """Returns the loaded tools."""
        tools = {}
        for name, tool in self.tools.items():
            if tool["id"] in user_tool_ids:
                tools[name] = tool["function"]
        return tools
    async def run_tool(self, tool_name: str, **kwargs) -> Any:
        """
        Executes a tool by name, handling async or sync calls.

        Args:
            tool_name (str): The name of the tool to run.
            kwargs: Arguments to pass to the tool.

        Returns:
            Any: The result of the tool execution.
        """
        tool = self.tools.get(tool_name)["function"]
        if not tool:
            raise ValueError(f"Tool '{tool_name}' not found.")

        if self.is_async(tool):
            return await tool(**kwargs)
        return tool(**kwargs)