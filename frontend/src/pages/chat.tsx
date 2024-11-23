import { useState, useEffect } from "react";
import { Chat } from "@/features/chat/components/chat";
import { ConversationHistory } from "@/features/conversation/components/conversation-history";
import { useSearchParams } from "react-router-dom";

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState(
    searchParams.get("c") || "",
  );

  function handleSelectedChatId(id: string) {
    setSelectedChatId(id);
    setSearchParams({ c: id });
  }

  useEffect(() => {
    setSelectedChatId(searchParams.get("c") || "");
  }, [searchParams]);

  return (
    <div className=" w-full h-screen flex overflow-hidden">
      <ConversationHistory onSelectedIdChange={handleSelectedChatId} />
      <div className="w-full h-full flex flex-col justify-between">
        <Chat chatId={selectedChatId} onCreateNewChat={handleSelectedChatId} />
      </div>
    </div>
  );
}
