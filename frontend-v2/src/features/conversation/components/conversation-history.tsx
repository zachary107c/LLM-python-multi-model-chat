import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetConversationsQuery } from "@/features/conversation/api/get-conversations";
import { Conversation, GroupedConverations } from "@/types/api";
import { ConversationList } from "./conversation-list";
import { ConversationListLoading } from "./conversation-list-loading";
// import { useGetUserSettingsQuery } from "@/components/userSettings/api/get-user-settings";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageSquarePlus,
} from "lucide-react";
import { SidebarMenuSub } from "@/components/ui/sidebar";

export function ConversationHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [_, setAnimating] = useState(false);
  const currentConversationId = searchParams.get("c");
  const { data: chats, isLoading: conversationsLoading } =
    useGetConversationsQuery();
  const createMutation = createConversationMutation();
  const [bookmarkedChats, setBookmarkChats] = useState<Conversation[]>([]);
  const [nonBookmarkChats, setNonBookmarkChats] = useState<GroupedConverations>(
    {
      Today: [],
      "This Week": [],
      "This Month": [],
      Old: [],
    }
  );

  useEffect(() => {
    if (chats) {
      // Sort chats by created_at in descending order (latest first)
      const sortedChats = [...chats].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Collect all bookmarked chats
      const likedChats = sortedChats.filter((chat) => chat.liked);
      setBookmarkChats(likedChats);

      // Reset non-bookmarked chats grouping
      const groupedNonBookmarkChats: GroupedConverations = {
        Today: [],
        "This Week": [],
        "This Month": [],
        Old: [],
      };

      // Group non-bookmarked chats based on existing grouping
      sortedChats.forEach((chat) => {
        if (!chat.liked && chat.grouping !== undefined) {
          groupedNonBookmarkChats[chat.grouping].push(chat);
        }
      });

      setNonBookmarkChats(groupedNonBookmarkChats);
    }
  }, [chats]);

  return (
    <>
      {conversationsLoading ? (
        <ConversationListLoading />
      ) : (
        <>
          {bookmarkedChats.length > 0 && (
            <SidebarMenuSub>
              <ConversationList chats={bookmarkedChats} title="Favorited" />
            </SidebarMenuSub>
          )}
          {nonBookmarkChats.Today.length > 0 && (
            <SidebarMenuSub>
              <ConversationList chats={nonBookmarkChats.Today} title="Today" />
            </SidebarMenuSub>
          )}
          {nonBookmarkChats["This Week"].length > 0 && (
            <SidebarMenuSub>
              <ConversationList
                chats={nonBookmarkChats["This Week"]}
                title="This Week"
              />
            </SidebarMenuSub>
          )}
          {nonBookmarkChats["This Month"].length > 0 && (
            <SidebarMenuSub>
              <ConversationList
                chats={nonBookmarkChats["This Month"]}
                title="This Month"
              />
            </SidebarMenuSub>
          )}
          {nonBookmarkChats.Old.length > 0 && (
            <SidebarMenuSub>
              <ConversationList chats={nonBookmarkChats.Old} title="Old" />
            </SidebarMenuSub>
          )}
        </>
      )}
    </>
  );
}
