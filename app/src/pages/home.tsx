import { ChatBot } from "@/features/chat/components/message"

export default function HomePage() {
    return (
        <div className="w-full h-full flex">
            <div className="w-full">
                <ChatBot />
            </div>
        </div>
    )
};