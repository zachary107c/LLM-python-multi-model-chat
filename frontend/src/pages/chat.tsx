import { useState, useEffect } from "react";
import { Chat } from "@/features/chat/components/chat";
import { ChatHistory } from "@/features/conversation/components/chat-history";
import { useSearchParams } from 'react-router-dom';

export default function ChatPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedChatId, setSelectedChatId] = useState(searchParams.get("c") || null);

    function handleSelectedChatId(id: string) {
        setSelectedChatId(id);
        setSearchParams({ c: id });
    }

    useEffect(() => {
        setSelectedChatId(searchParams.get("c") || null);
    }, [searchParams]);

    return (
        <div className="w-full h-screen flex overflow-hidden">
            <ChatHistory onSelectedIdChange={handleSelectedChatId} />
            <div className="w-full h-full flex flex-col justify-between">
                <Chat chatId={selectedChatId} onCreateNewChat={handleSelectedChatId}/>
            </div>
        </div>
    );
};