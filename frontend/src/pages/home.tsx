import { useState } from "react"
import { Chat } from "@/features/chat/components/chat"
import { ChatHistory } from "@/features/chatHistory/components/chat-history"
import { PinLeftIcon, PinRightIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"

export default function HomePage() {
    const [expanded, setExpanded] = useState(true)

    function handleSetExpanded(e: any) {
        setExpanded(e)
    }

    return (
        <div className="w-full h-full flex overflow-hidden">
            <div className={`${expanded ? 'w-[15%]' : 'w-[2%]'} border-r border-[#7d7d7d68] ease-in-out duration-300`}>
                <div className="flex justify-end">
                    {/* <Button variant={'ghost'} className="m-1 p-1">
                        {expanded ? <PinLeftIcon onClick={() => handleSetExpanded(false)} /> : <PinRightIcon onClick={() => handleSetExpanded(true)} />}
                    </Button> */}
                    <Button variant={'ghost'} className="m-1 p-2" >
                        <Pencil2Icon />
                    </Button>
                </div>
                <ChatHistory />
            </div>
            <div className="w-full">
                <Chat />
            </div>
        </div>
    )
};