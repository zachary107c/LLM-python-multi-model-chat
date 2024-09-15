import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getConversations } from "@/features/chatHistory/api/get-conversations";
import { Conversation } from "@/types/api";


export function ChatHistory({ onSelectedIdChange }: any) {

    const [selected, setSelected] = useState(-1);
    const [chats, setHistory] = useState<Conversation[]>();



    function handleSetSelected(index: number) {
        if (chats !== null && chats !== undefined) {
            setSelected(index);
            onSelectedIdChange(chats[index]?.id);
        }
    }

    useEffect(() => {
        const fetchChatHistory = async () => {
            const response = await getConversations();
            setHistory(response);
        };
        fetchChatHistory();
    }, []);


    return (
        <div className="mx-4">
            <div className="flex flex-col justify-center align-top mt-2">
                <div className="flex flex-col w-full">
                    {chats?.map((chat, index) => (
                        <div className="w-full flex justify-start overflow-hidden">
                            {
                                index === selected ?
                                    <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(index)}>
                                        {chat.title}
                                    </Button>
                                    :
                                    <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between " onClick={() => handleSetSelected(index)}>
                                        {chat.title}
                                    </Button>
                            }
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}