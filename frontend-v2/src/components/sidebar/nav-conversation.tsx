import { MessageSquarePlus, MessageSquare, ChevronRight } from "lucide-react";
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

import { ConversationHistory } from "@/features/conversation/components/conversation-history";

export function NavConversation() {
  const { open } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <Button variant="default">
          {open && 'New Conversation' } <MessageSquarePlus />
        </Button>
        <Collapsible
          key="conversation-list"
          asChild
          defaultOpen={false}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Conversations">
                <MessageSquare />
                <span>Conversations</span>
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
