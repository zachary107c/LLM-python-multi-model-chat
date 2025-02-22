import * as React from "react";
import {
  useSidebar,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavConversation } from "@/components/sidebar/nav-conversation";
import { NavUser, NavUserSkeleton } from "@/components/sidebar/nav-user";
import { useUser } from "@/lib/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { data: user, isLoading: userLoading } = useUser();

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
        <NavConversation />
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        {userLoading ? <NavUserSkeleton /> : <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
