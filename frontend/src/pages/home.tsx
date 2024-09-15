import { useState } from "react";
import { Chat } from "@/features/chat/components/chat";
import { ChatHistory } from "@/features/chatHistory/components/chat-history";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useSearchParams } from 'react-router-dom';

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [expanded, setExpanded] = useState(true);
    const [selectedChatId, setSelectedChatId] = useState(searchParams.get("c"));


    function handleSetExpanded(e: any) {
        setExpanded(e);
    }

    function handleSelectedChatId(id: any) {
        setSelectedChatId(id);
    }

    return (
        <div className="w-full h-full flex overflow-hidden">
            <div className={`${expanded ? 'w-[15%]' : 'hidden'} border-r border-[#7d7d7d68]`}>
                <div className="flex justify-end items-center mx-2 mt-2">
                    {/* <Button variant={'ghost'} className="m-1 p-1">
                        <PinLeftIcon onClick={() => handleSetExpanded(false)} />
                    </Button> */}
                    <Button variant={'ghost'}>
                        <PlusIcon />
                    </Button>
                </div>
                <ChatHistory onSelectedIdChange={handleSelectedChatId} />
            </div>
            <div className="w-full">
                <Chat token={Cookies.get('token')} chatId={selectedChatId} />
            </div>
        </div>
    )
};