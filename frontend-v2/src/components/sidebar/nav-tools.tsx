import { PencilRulerIcon } from "lucide-react";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import { useToolId } from "@/features/tools/contexts/toolsContext";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarMenuButton } from "../ui/sidebar";
import { useSidebar } from "../ui/sidebar";

export function NavTools() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId, setConversationId } = useConversationId();
  const { toolId, setToolId } = useToolId();
  const { open } = useSidebar();

  const isToolsRoute = location.pathname === "/tools";

  return (
    <SidebarMenuButton
      onClick={() => {
        if (conversationId) setConversationId("");
        if (toolId) setToolId("");
        navigate("/tools");
      }}
      className={`${isToolsRoute ? "bg-accent-2" : ""}`}
    >
      <PencilRulerIcon />
      {/* Show text only when not collapsed */}
      {open && <span className="font-semibold">Tools</span>}
    </SidebarMenuButton>
  );
}
