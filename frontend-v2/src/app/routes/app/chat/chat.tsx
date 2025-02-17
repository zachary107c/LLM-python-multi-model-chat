import { ChatArea } from "@/features/chatArea/components/chatArea"

export function ChatRoute() {
    return (
        <div className="flex flex-col justify-end items-center h-full w-full">
            <div className="w-[60%] h-full">
                <ChatArea />
            </div>
        </div>
    )
};