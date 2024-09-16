import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getConversations } from "@/features/chatHistory/api/get-conversations";
import { createConversation } from "@/features/chatHistory/api/create-conversation";
import { deleteConversation } from "../api/delete-conversation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, PinLeftIcon, PinRightIcon, TrashIcon } from "@radix-ui/react-icons";
import { useSearchParams } from 'react-router-dom';


export function ChatHistory({ onSelectedIdChange }: any) {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [expanded, setExpanded] = useState(true);
    const currentConversationId = searchParams.get('c');

    // Get the conversations
    const { data: chats, isLoading } = useQuery(
        {
            queryFn: () => getConversations(),
            queryKey: ["conversations"],
        }
    );

    // Create a new conversation
    const { mutateAsync: createConversationMutation } = useMutation({
        mutationFn: createConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });

    // Delete a conversation
    const { mutateAsync: deleteConversationMutation } = useMutation({
        mutationFn: deleteConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });


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
            var response = await createConversationMutation({ data: { title: "New Conversation" } });
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
                                    <Button variant={"ghost-no-hover"} className="mx-1 px-1 py-0 my-0" onClick={async () => {
                                        try {
                                            await deleteConversationMutation({ conversationId: chat.id })
                                        } catch (e) {
                                            console.log(e)
                                        }
                                    }}>
                                        <TrashIcon />
                                    </Button>
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