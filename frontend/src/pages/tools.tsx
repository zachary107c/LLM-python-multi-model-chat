import { useState } from "react";
import { ToolInfo } from "@/features/tool/components/tool-info";
import { Tools } from "@/features/tool/components/tools";

export default function ModelsPage() {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  return (
    <div className=" w-full h-screen flex overflow-hidden">
      <Tools
        selectedToolId={selectedToolId}
        onSelectedToolIdChange={setSelectedToolId}
      />
      <div className="w-full h-full flex flex-col justify-between">
        <ToolInfo toolId={selectedToolId} />
      </div>
    </div>
  );
}
