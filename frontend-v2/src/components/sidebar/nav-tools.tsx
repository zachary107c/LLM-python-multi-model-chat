import { Button } from "../ui/button";
import { PencilRulerIcon } from "lucide-react";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import { useToolId } from "@/features/tools/contexts/toolsContext";
import { useNavigate, useLocation } from "react-router-dom";

export function NavTools() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId, setConversationId } = useConversationId();
  const { toolId, setToolId } = useToolId();

  const isToolsRoute = location.pathname === "/tools";

  return (
    <div className="flex justify-start items-center w-full">
      <Button
        variant="ghost"
        className={`w-full flex justify-start items-center gap-2 px-2 ${
          isToolsRoute ? "bg-accent-2 hover:bg-accent-2" : "hover:bg-accent-2"
        }`}
        onClick={() => {
          if (conversationId) setConversationId("");
          if (toolId) setToolId("");
          navigate("/tools");
        }}
      >
        <PencilRulerIcon />
        Tools
      </Button>
    </div>
  );
}
