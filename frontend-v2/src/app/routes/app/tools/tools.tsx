import { ToolsArea } from "@/features/tools/components/tools-area";
import EditToolArea from "@/features/tools/components/edit-tool-area";
import { useToolId } from "@/features/tools/contexts/toolsContext";

export function ToolsRoute() {
  const { toolId } = useToolId();

  return toolId ? <EditToolArea toolId={toolId} /> : <ToolsArea />;
}