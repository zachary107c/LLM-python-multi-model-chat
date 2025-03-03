import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import useScrollToEnd from "../hooks/use-scroll-to-end";
import { ChatInput } from "@/features/chatInput/components/chat-input";
import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import MessagesList from "./MessagesList";
import { LoadingIndicator } from "./LoadingIndicator";
import { Welcome } from "@/features/suggestions/components/welcome";
import { useMessageHandling } from "../hooks/useMessageHandling";

import {
  UserMessage,
  AssistantMessage,
  BaseModelEntity,
} from "@/types/api";

export function ChatArea() {
  const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>([]);
  const [model, setModel] = useState<BaseModelEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState<File | null>(null);
  const [_, setSearchParams] = useSearchParams();
  const userSettings = useUser();
  const { conversationId, setConversationId } = useConversationId();

  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
  const {
    data,
    error,
    isLoading: conversationLoading,
  } = useGetConversationQuery({ conversationId });

  const { handleSendMessage } = useMessageHandling({
    conversationId,
    setConversationId,
    model,
    messages,
    setMessages,
    setIsLoading,
    imageData,
    userSettings
  });

  const ref = useScrollToEnd(messages);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (data) {
      const newMessages = data.messages.map((message: any) => {
        return message.type === "user"
          ? ({ ...message, type: "user" } as UserMessage)
          : ({ ...message, type: "assistant" } as AssistantMessage);
      });
      setMessages(newMessages);
    } else {
      setMessages([]);
    }

    if (!conversationId) {
      setMessages([]);
    }
  }, [data]);

  useEffect(() => {
    if (models && models.length > 0 && !model) {
      const preferredModel = models.find(
        (m) =>
          m.name ===
          (userSettings.data?.settings.preferred_model?.name ||
            "llama3.1:latest")
      );
      setModel(preferredModel || models[0]);
    }
  }, [models, model]);

  useEffect(() => {
    if (conversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    }
  }, [conversationId]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Conversation Error",
        description: "Failed to load messages for conversation.",
        variant: "destructive",
      });
      setConversationId("");
      setSearchParams({});
    }
  }, [error]);

  // Memoized components to prevent unnecessary re-renders
  const loadingIndicator = useMemo(() => {
    if (conversationLoading) {
      return <LoadingIndicator />;
    }
    return null;
  }, [conversationLoading]);

  const welcomeSection = useMemo(() => {
    if (!messages?.length && !conversationLoading) {
      return <Welcome handleMessageSend={handleSendMessage} />;
    }
    return null;
  }, [messages?.length, conversationLoading, handleSendMessage]);

  const messagesListComponent = useMemo(() => {
    return messages.length > 0 ? <MessagesList messages={messages} /> : null;
  }, [messages]);

  const chatInputComponent = useMemo(() => {
    return (
      <ChatInput
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onModelChange={setModel}
        onImageDataChange={setImageData}
        selectedModel={model}
        models={models}
        modelsLoading={modelsLoading}
      />
    );
  }, [isLoading, handleSendMessage, model, models, modelsLoading]);

  return (
    <div className="flex flex-col items-center relative h-full w-full">
      <div className="flex flex-col justify-between align-middle h-full z-10 relative w-full">
        {loadingIndicator}
        <div className="h-full w-full pt-4 overflow-y-scroll no-scrollbar">
          {welcomeSection}
          {messagesListComponent}
          <div ref={ref} />
        </div>
        {chatInputComponent}
        <div className="w-full flex justify-center items-center">
          <span className="text-muted-foreground text-xs italic">
            AI can make mistakes. Check important information.
          </span>
        </div>
      </div>
    </div>
  );
}