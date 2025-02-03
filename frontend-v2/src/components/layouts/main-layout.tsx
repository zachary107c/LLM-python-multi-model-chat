import { ReactNode } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ConversationProvider } from "@/features/conversation/contexts/conversationContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ConversationProvider>
      <div className="flex h-screen max-h-[100dvh] overflow-hidden w-full">
        {/* Sidebar */}
        <AppSidebar />
        <SidebarInset>
          <main className="relative z-0 flex flex-col flex-1 bg-secondary py-4 pr-4 pl-4 w-full max-w-full">
            <div className="flex flex-col bg-background rounded-xl h-full overflow-hidden w-full">
              <h1>Chat</h1>
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </ConversationProvider>
  );
}
