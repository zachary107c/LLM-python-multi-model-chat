import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { DeleteConversationModal } from "./delete-conversation-modal";
import { useSearchParams } from 'react-router-dom';
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { deleteConversationMutation } from "@/features/conversation/api/delete-conversation";
import { useGetConversationQuery } from "@/features/conversation/api/get-conversations";


export function ChatHistory({ onSelectedIdChange }: any) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [expanded, setExpanded] = useState(true);
    const currentConversationId = searchParams.get('c');
    const { data: chats, isLoading } = useGetConversationQuery();
    const createMutation = createConversationMutation();
    const deleteMutation = deleteConversationMutation();


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
            var response = await createMutation.mutateAsync({ data: { title: "New Conversation" } });
            setSearchParams({ c: response.id });
            handleSetSelected(response.id);
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className={`${expanded ? 'w-[250px] max-w-[250px]' : ''}`}>
            {
                (!expanded)
                &&
                (
                    <div className="border-r border-[#7d7d7d68] h-full">
                        <div className="mx-2 mt-2">
                            <Button variant={'ghost'} className="m-1 p-1">
                                <PinRightIcon onClick={() => handleSetExpanded(true)} />
                            </Button>
                        </div>
                    </div>
                )
            }
            <div className={`${expanded ? '' : 'hidden'} border-r border-[#7d7d7d68] h-full`}>
                <div className="flex justify-between items-center mx-2 mt-2">
                    <Button variant={'ghost'} className="m-1 p-1">
                        <PinLeftIcon onClick={() => handleSetExpanded(false)} />
                    </Button>
                    <Button variant={'ghost'} className="m-1 p-1" onClick={async () => handleNewConversation()}>
                        <PlusIcon />
                    </Button>
                </div>
                <div className="mx-2">
                    <div className="flex flex-col justify-center align-top mt-2">
                        <div className="flex flex-col w-full">
                            {chats?.map((chat, index) => (
                                <div className="w-full flex justify-between items-center">
                                    <div className="w-full overflow-hidden">
                                        {
                                            chat.id === currentConversationId ?
                                                <Button size='sm' variant={'ghost'} className="w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(chat.id)}>
                                                    {chat.title}
                                                </Button>
                                                :
                                                <Button size='sm' variant={'ghost'} className="w-full justify-between " onClick={() => handleSetSelected(chat.id)}>
                                                    {chat.title}
                                                </Button>
                                        }
                                    </div>
                                    <DeleteConversationModal conversationId={chat.id} deleteMutation={deleteMutation} />
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}