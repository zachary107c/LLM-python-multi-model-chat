import { memo } from "react";
import { UserMessage, AssistantMessage } from "@/types/api";
import UserChatMessage from "@/features/chatMessage/components/user-chat-message";
import AssistantChatMessage from "@/features/chatMessage/components/assistant-chat-message";
import useScrollToEnd from "../hooks/use-scroll-to-end";

interface MessageListProps {
  messages: (UserMessage | AssistantMessage)[];
}


const MessageList = memo(function MessageList({ messages }: MessageListProps) {
  const scrollRef = useScrollToEnd(messages);
  
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={`message-${message.type}-${message.id}`}>
          {message.type === "user" ? (
            <UserChatMessage userMessageData={message as UserMessage} />
          ) : (
            <AssistantChatMessage assistantMessageData={message as AssistantMessage} />
          )}
        </div>
      ))}
      <div ref={scrollRef} />
    </div>
  );
});

export default MessageList;
