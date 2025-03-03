import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "../theme/components/theme-toggle";
import { User } from "@/types/api";
import { Button } from "../ui/button";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import { useTheme } from "../theme/theme-provider";

export function NavUser({ user }: { user: User | undefined | null }) {
  const { isMobile } = useSidebar();
  const [_, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const logout = useLogout();
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { conversationId, setConversationId } = useConversationId();
  const { avatarOverlay } = useTheme();
  const handleLogout = async () => {
    try {
      navigate("logged-out", { replace: true });
      await logout.mutateAsync(undefined);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const avatarOverlayStyles: React.CSSProperties = {
    position: "relative",
    width: "32px", // h-8 equals 32px
    height: "32px", // w-8 equals 32px
    borderRadius: "inherit",
    overflow: "hidden",
    flexShrink: 0, // Prevent the avatar from shrinking
  };

  const overlayStyles: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "hsl(var(--primary))",
    mixBlendMode: "overlay",
    opacity: 0.5,
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-foreground/10"
            >
              <Avatar
                className="h-8 w-8 rounded-md"
                style={avatarOverlay ? avatarOverlayStyles : undefined}
              >
                <AvatarImage
                  src={user?.profile?.image}
                  alt={user?.username}
                  className={avatarOverlay ? "grayscale" : ""}
                />
                {avatarOverlay && <div style={overlayStyles}></div>}
                <AvatarFallback className="rounded-md">BS</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.username}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <Button
                className="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                variant="ghost"
                onClick={() => {
                  setConversationId("");
                  navigate("/profile");
                }}
              >
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage
                    src={user?.profile?.image}
                    alt={user?.username}
                    className={avatarOverlay ? "grayscale" : ""}
                  />
                  {avatarOverlay && <div style={overlayStyles}></div>}
                  <AvatarFallback className="rounded-lg">BS</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.username}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ThemeToggle
                variant="dropdown"
                onThemeSelect={() => setIsOpen(true)}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUserSkeleton() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-lg" />
              </Avatar>
              <div className="grid flex-1 gap-2 text-left text-sm leading-tight">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </Avatar>
                <div className="grid flex-1 gap-2 text-left text-sm leading-tight">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
