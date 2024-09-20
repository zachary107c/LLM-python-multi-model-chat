import { useState, useEffect } from "react";
import { Chat } from "@/features/chat/components/chat";
import { ChatHistory } from "@/features/conversation/components/chat-history";
import { ChatHeader } from "@/features/chat/components/chat-header";
import { useSearchParams } from 'react-router-dom';

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedChatId, setSelectedChatId] = useState(searchParams.get("c"));

    function handleSelectedChatId(id: any) {
        setSelectedChatId(id);
    }

    useEffect(() => {
        setSelectedChatId(() => searchParams.get("c"));
    }, [searchParams]);

    return (
        <div className="w-full h-screen flex overflow-hidden">
            <ChatHistory onSelectedIdChange={handleSelectedChatId} />
            <div className="w-full h-full flex flex-col justify-between">
                <Chat chatId={selectedChatId} />
            </div>
        </div>
    )
};