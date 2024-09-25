import { useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tooltip, Popover } from "@radix-ui/themes";
import { PlusIcon, PinLeftIcon, PinRightIcon, DotsHorizontalIcon, MagicWandIcon, TextAlignLeftIcon } from "@radix-ui/react-icons";
import { DeleteConversationModal } from "./delete-conversation-modal";
import { UpdateConversationModal } from "./edit-conversation-modal";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetConversationsQuery } from "@/features/conversation/api/get-conversations";
import { useGenerateConversationTitle } from "../hooks/generate-conversation-title";
import { MagicTitleButton } from "@/features/conversation/components/magic-title-button";


export function ChatHistory({ onSelectedIdChange, setMessages }: any) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [expanded, setExpanded] = useState(true);
    const currentConversationId = searchParams.get('c');
    const { data: chats, isLoading } = useGetConversationsQuery();
    const createMutation = createConversationMutation();


    function handleSetExpanded(e: any) {
        setExpanded(e);
    };


    function handleSetSelected(conversationId: string) {
        if (chats !== null && chats !== undefined) {
            onSelectedIdChange(conversationId);
            setSearchParams({ c: conversationId });
        }
    }

    async function handleNewConversation() {
        try {
            var response = await createMutation.mutateAsync({ data: { previousConversationId: currentConversationId || undefined, data: { title: "New Conversation" } } });
            setSearchParams({ c: response.id });
            handleSetSelected(response.id);
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className={`${expanded ? 'w-[250px] max-w-[250px] h-full' : 'h-full'}`}>
            {!expanded &&
                <div className="overflow-y-scroll no-scrollbar border-r border-[#7d7d7d68] h-full">
                    <div className="mx-2 mt-2">
                        <Button variant={'ghost'} className="p-2">
                            <PinRightIcon onClick={() => handleSetExpanded(true)} />
                        </Button>
                    </div>
                </div>
            }
            <div className={`${expanded ? 'overflow-y-scroll no-scrollbar' : 'hidden'
                } border-r border-[#7d7d7d68] w-full h-full`}>
                <div className="flex justify-between items-center mx-2 mt-2">
                    <Button variant={'ghost'} className="p-2">
                        <PinLeftIcon onClick={() => handleSetExpanded(false)} />
                    </Button>
                    <Tooltip content="New Conversation" side="right">
                        <Button variant={'ghost'} className="ml-2 p-2" onClick={async () => handleNewConversation()}>
                            <PlusIcon />
                        </Button>
                    </Tooltip>
                </div>
                <div className="mx-2">
                    <div className="flex flex-col justify-center align-top">
                        <div className="flex flex-col w-full">
                            {chats?.map((chat) => (
                                <div className="w-full flex justify-between items-center">
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
                                    <Popover.Root>
                                        <Popover.Trigger>
                                            <Button variant="ghost" size='icon'>
                                                <DotsHorizontalIcon />
                                            </Button>
                                        </Popover.Trigger>
                                        <Popover.Content side="right">
                                            <div className="flex flex-col items-start">
                                                <UpdateConversationModal conversationId={chat.id} currentTitle={chat.title} />
                                                <DeleteConversationModal conversationId={chat.id} />
                                                <MagicTitleButton conversationId={chat.id} />
                                            </div>
                                        </Popover.Content>
                                    </Popover.Root>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}