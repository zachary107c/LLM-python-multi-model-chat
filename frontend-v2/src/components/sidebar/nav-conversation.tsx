import {
  MessageSquarePlus,
  MessageSquare,
  ChevronRight,
  UserIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

import { ConversationHistory } from "@/features/conversation/components/conversation-history";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";

export function NavConversation() {
  const { open } = useSidebar();
  const { conversationId, setConversationId } = useConversationId();
  const createConversation = createConversationMutation();
  const navigate = useNavigate();

  async function createNewConversation() {
    try {
      var response = await createConversation.mutateAsync({
        data: {
          previousConversationId: conversationId || undefined,
          data: { title: "New Conversation" },
        },
      });
      setConversationId(response.id);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Button
          variant="default"
          onClick={async () => await createNewConversation()}
        >
          {open && "New Conversation"} <MessageSquarePlus />
        </Button>

        <Collapsible
          key="conversation-list"
          asChild
          defaultOpen={true}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Conversations">
                <MessageSquare />
                <span className="font-bold">Conversations</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ConversationHistory />
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
