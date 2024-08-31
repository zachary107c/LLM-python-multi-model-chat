import ChatInput from "../components/ui/chatInput";
import ChatComponent from "../components/ui/chat_v2";
export default function HomePage() {
    return (
        <div className="h-screen max-h-[100dvh] md:max-w-[calc(100%-260px)] w-full max-w-full flex flex-col justify-between mx-auto">
            <h1>HOME</h1>
            <div className="p-2">
                <ChatComponent />
            </div>
        </div>
    )
};