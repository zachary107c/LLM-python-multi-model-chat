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
// import { useGetUserSettingsQuery } from "@/features/userSettings/api/get-user-settings";
import { useUser } from "@/lib/auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { data: user, isLoading: userLoading} = useUser();

  return (
    <Sidebar collapsible="icon" { ...props } className="border-none">
      <div
        className={`flex items-center p-2 ${
          open ? "justify-between" : "justify-center"
        }`}
      >
        {open && <span className="text-xl font-medium italic">bruh.</span>}
        <SidebarTrigger />
      </div>
      <SidebarContent className="no-scrollbar">
        <NavConversation />
      </SidebarContent>
      <SidebarFooter>
        {userLoading ? (
          <NavUserSkeleton />
        ) : (
          <NavUser user={user} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
