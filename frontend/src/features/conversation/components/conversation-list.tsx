import { Button } from "@/components/ui/button";
import { Tooltip, Popover } from "@radix-ui/themes";
import { DotsHorizontalIcon} from "@radix-ui/react-icons";
import { DeleteConversationModal } from "./delete-conversation-modal";
import { UpdateConversationModal } from "./edit-conversation-modal";
import { MagicTitleButton } from "@/features/conversation/components/magic-title-button";
import { BookmarkConversationButton } from "./like-conversation-button";
import { Conversation } from "@/types/api";
import { Separator } from "@radix-ui/themes";


export function ConversationList({ chats, currentConversationId, handleSetSelected }: { chats: Conversation[], currentConversationId: string | null, handleSetSelected: any }) {
    return (
        <div>
            {chats?.map((chat) => (
                <div className="w-full flex justify-between items-center" key={chat.id}>
                    <div className="w-full overflow-hidden">
                        <Tooltip content={chat.title} side="right">
                            {chat.id === currentConversationId ?
                                <Button size='sm' variant={'ghost'} className="w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(chat.id)}>
                                    {chat.title}
                                </Button>
                                :
                                <Button size='sm' variant={'ghost'} className="w-full justify-between " onClick={() => handleSetSelected(chat.id)}>
                                    {chat.title}
                                </Button>
                            }
                        </Tooltip>
                    </div>
                    <div className="flex">
                        <BookmarkConversationButton conversationId={chat.id} isLiked={chat.liked} />
                        <Popover.Root>
                            <Popover.Trigger>
                                <Button variant="ghost" size='icon'>
                                    <DotsHorizontalIcon />
                                </Button>
                            </Popover.Trigger>
                            <Popover.Content side="bottom">
                                <div className="flex flex-col items-start">
                                    <UpdateConversationModal conversationId={chat.id} currentTitle={chat.title} />
                                    <MagicTitleButton conversationId={chat.id} />
                                    <Separator size='4'/>
                                    <DeleteConversationModal conversationId={chat.id} />
                                </div>
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                </div>
            ))}
        </div>
    );
}