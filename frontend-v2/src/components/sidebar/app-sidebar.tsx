import * as React from "react";
import {
  useSidebar,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { NavConversation } from "@/components/sidebar/nav-conversation";
import { NavUser, NavUserSkeleton } from "@/components/sidebar/nav-user";
import { NavTools } from "./nav-tools";
import { useUser } from "@/lib/auth";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { MessageSquarePlusIcon } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { data: user, isLoading: userLoading } = useUser();

  const { conversationId, setConversationId } = useConversationId();
  const createConversation = createConversationMutation();

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
    <Sidebar
      collapsible="icon"
      variant="floating"
      {...props}
      className="border-none bg-background shadow-none"
    >
      {/* Trigger Section with Background Image */}
      <div className="relative">
        {/* Background Image and Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="bruh_shell_no_logo.png"
            alt="Image"
            className="w-full h-full object-cover dark:brightness-[0.8] grayscale rounded-t-md"
          />
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundColor: "hsl(var(--primary))",
              mixBlendMode: "overlay",
              opacity: 0.5,
            }}
          ></div>
        </div>

        {/* Trigger Content */}
        <div
          className={`relative flex items-center p-2 ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          {open && <span className="text-xl font-medium italic">bruh.</span>}
          <SidebarTrigger variant="ghostNoHover" />
        </div>
      </div>
      {/* Sidebar Content */}
      <SidebarContent className="no-scrollbar">
        <SidebarGroup>
          <div className="flex justify-start items-center w-full pb-2">
            <Button
              variant="secondary"
              onClick={async () => await createNewConversation()}
              className="bg-accent-2 hover:bg-primary/50 transition-colors duration-200 w-full"
            >
              {open && "New Conversation"} <MessageSquarePlusIcon />
            </Button>
          </div>
          <NavTools />
          <NavConversation />
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        {userLoading ? <NavUserSkeleton /> : <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
