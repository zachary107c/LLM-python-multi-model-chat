import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Ellipsis } from "lucide-react";
import { DeleteConversationModal } from "./delete-conversation-modal";
import { UpdateConversationModal } from "./edit-conversation-modal";
import { MagicTitleButton } from "@/features/conversation/components/magic-title-button";
import { PinConversationButton } from "./pin-conversation-button";
import { Conversation } from "@/types/api";
import { Separator } from "@/components/ui/separator";
import { useConversationId } from "../contexts/conversationContext";

export function ConversationList({
  title,
  chats,
}: {
  title: string | null;
  chats: Conversation[];
}) {
  const { conversationId, setConversationId } = useConversationId();

  return (
    <div>
      {title && <span className="text-xs">{title}</span>}
      {chats?.map((chat) => (
        <div
          className="w-full relative flex items-center hover:bg-accent/50 rounded-md [&:hover>div:last-child]:opacity-100"
          key={chat.id}
        >
          <div className="w-full overflow-hidden">
            {chat.id === conversationId ? (
              <Button
                size="sm"
                variant={"ghost"}
                className="w-full justify-between bg-accent text-accent-foreground truncate"
                onClick={() => setConversationId(chat.id)}
              >
                {chat.title}
              </Button>
            ) : (
              <Button
                size="sm"
                variant={"ghost"}
                className="w-full justify-between overflow-hidden"
                onClick={() => setConversationId(chat.id)}
              >
                {chat.title}
              </Button>
            )}
          </div>
          <div className={`absolute right-0 flex justify-center transition-opacity ${
            chat.id === conversationId ? 'opacity-100' : 'opacity-0'
          } before:absolute before:inset-y-0 before:right-full before:w-8 before:bg-gradient-to-r before:from-transparent before:to-background/80`}>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-sidebar">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom">
                <div className="flex flex-col items-start">
                  <PinConversationButton
                    conversationId={chat.id}
                    isLiked={chat.liked}
                  />
                  <UpdateConversationModal
                    conversationId={chat.id}
                    currentTitle={chat.title}
                  />
                  <MagicTitleButton conversationId={chat.id} />
                  <Separator />
                  <DeleteConversationModal conversationId={chat.id} />
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}
    </div>
  );
}