import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { HashLoader } from "react-spinners";

import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import useScrollToEnd from "../hooks/use-scroll-to-end";

import { ChatInput } from "@/features/chatInput/components/chat-input";
import { createUserMessage } from "@/features/chatMessage/api/create-user-message";
import { createAssistantMessage } from "@/features/chatMessage/api/create-assistant-message";
import { updateConversationMutation } from "@/features/conversation/api/update-conversation";
import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";

import { UserChatMessage } from "@/features/chatMessage/components/user-chat-message";
import { AssistantChatMessage } from "@/features/chatMessage/components/assistant-chat-message";
import { Welcome } from "@/features/suggestions/components/welcome";
import { WelcomeLoading } from "@/features/suggestions/components/welcome-loading";

import {
  UserMessage,
  AssistantMessage,
  BaseModelEntity,
  Message,
} from "@/types/api";

export function ChatArea() {
  const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>(
    []
  );
  const [model, setModel] = useState<BaseModelEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState<File | null>(null);
  const [_, setSearchParams] = useSearchParams();
  const userSettings = useUser();
  const { conversationId, setConversationId } = useConversationId();

  const updateMutation = updateConversationMutation();
  const createMutation = createConversationMutation();
  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
  const {
    data,
    error,
    isLoading: conversationLoading,
  } = useGetConversationQuery({ conversationId });

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

  const isUserMessage = (message: Message): message is UserMessage =>
    message.type === "user";
  const isAssistantMessage = (message: Message): message is AssistantMessage =>
    message.type === "assistant";

  const handleCreateNewConversation = async (firstMessage: string) => {
    const response = await createMutation.mutateAsync({
      data: {
        previousConversationId: conversationId || undefined,
        data: { title: firstMessage },
      },
    });
    setConversationId(response.id);
    return response.id;
  };

  const toDataURL = async (
    url: string | null
  ): Promise<{ base64: string; type: string } | null> => {
    if (!url) return null;

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const [header, base64String] = base64Data.split(",");
        const typeMatch = header.match(/:(.*?);/);
        typeMatch
          ? resolve({ base64: base64String, type: typeMatch[1] })
          : reject(new Error("Failed to extract MIME type"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendMessage = async (message: string, useTools: boolean) => {
    if (message.trim().length === 0) return;

    let currentChatId = conversationId;
    let shouldAddMessageManually = true;

    if (!conversationId) {
      currentChatId = await handleCreateNewConversation(message);
      shouldAddMessageManually = false;
    }

    const userPostData = await createUserMessage({
      data: { conversation: currentChatId, content: message, image: imageData },
    });

    if (messages.length === 0) {
      await updateMutation.mutateAsync({
        data: { conversationId: currentChatId, updates: { title: message } },
      });
    }

    const newUserMessage: UserMessage = { ...userPostData, type: "user" };

    if (shouldAddMessageManually) {
      setMessages((messages) => [...messages, newUserMessage]);
    }

    setIsLoading(true);

    const image_data = await toDataURL(userPostData.image);
    const payload = {
      model: model?.model,
      provider: model?.provider,
      conversation: currentChatId,
      useTools,
      messages: getMessagesForProvider(model?.provider, image_data, message),
    };

    try {
      if (userSettings.data?.settings?.stream_responses) {
        await handleStreamResponse(payload, newUserMessage, currentChatId);
      } else {
        await handleDirectResponse(payload, newUserMessage, currentChatId);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Chat Error",
        description: `Failed to Chat with the AI: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getImagePayloadForProvider = (
    provider: string | undefined,
    image_data: { base64: string; type: string } | null,
    message: string
  ): Record<string, any> => {
    if (image_data === null) {
      if (provider !== "google") {
        return {
          content: message,
        };
      } else {
        return {
          parts: [{ text: message }],
        };
      }
    }
    switch (provider) {
      case "ollama":
        return {
          images: [image_data.base64],
          content: message,
        };
      case "openai":
        return {
          content: [
            { type: "text", text: message },
            {
              type: "image_url",
              image_url: {
                url: `data:${image_data.type};base64,${image_data.base64}`,
              },
            },
          ],
        };
      case "anthropic":
        return {
          content: [
            { type: "text", text: message },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: image_data.type,
                data: image_data.base64,
              },
            },
          ],
        };
      case "google":
        return {
          parts: [
            { text: message },
            {
              inline_data: {
                mime_type: image_data.type,
                data: image_data.base64,
              },
            },
          ],
        };
      default:
        return {}; // No additional payload for providers without image support
    }
  };

  const getMessagesForProvider = (
    provider: string | undefined,
    image_data: { base64: string; type: string } | null,
    message: string
  ): Record<string, any> | Array<string> => {
    return [
      {
        role: "user",
        ...getImagePayloadForProvider(provider, image_data, message),
      },
    ];
  };

  const handleStreamResponse = async (
    payload: any,
    newUserMessage: UserMessage,
    currentChatId: string
  ) => {
    const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    let accumulatedContent = "";
    let tools_used: any = null;

    const reader = response.body?.getReader();
    while (true) {
      const { done, value } = (await reader?.read()) || {};
      if (done) break;

      const decoded = new TextDecoder().decode(value);
      const lines = decoded.split("\n");

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.message?.error) throw new Error(data.message.error);

            if (data.message?.content) {
              accumulatedContent += data.message.content;
              tools_used ??= data.tools_used;

              const tempAssistantMessage: AssistantMessage = {
                id: "temp",
                created_at: new Date().toISOString(),
                content_variations: [{ id: -1, content: accumulatedContent }],
                generated_by: newUserMessage,
                conversation: currentChatId,
                model: model || {
                  id: -1,
                  name: "",
                  model: "",
                  liked: false,
                  provider: "",
                  color: "gray",
                },
                provider: model?.provider || "",
                liked: false,
                type: "assistant",
                is_deleted: false,
                deleted_at: "",
                recoverable: false,
                tools_used: data.message.tools_used,
              };

              setMessages((messages) => {
                const lastMessage = messages[messages.length - 1];
                return lastMessage?.id === "temp"
                  ? [...messages.slice(0, -1), tempAssistantMessage]
                  : [...messages, tempAssistantMessage];
              });
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
          }
        }
      }
    }

    const assistantPostData = await createAssistantMessage({
      data: {
        conversation: currentChatId,
        content_variations: [accumulatedContent],
        model: model?.id || -1,
        provider: model?.provider || "ollama",
        generated_by: newUserMessage.id,
        tools_used,
      },
    });

    const finalAssistantMessage: AssistantMessage = {
      ...assistantPostData,
      type: "assistant",
    };
    setMessages((messages) =>
      messages[messages.length - 1]?.id === "temp"
        ? [...messages.slice(0, -1), finalAssistantMessage]
        : [...messages, finalAssistantMessage]
    );
  };

  const handleDirectResponse = async (
    payload: any,
    newUserMessage: UserMessage,
    currentChatId: string
  ) => {
    const response = await api.post("/chat/", payload);
    const assistantPostData = await createAssistantMessage({
      data: {
        conversation: currentChatId,
        content_variations: [(response as any).message.content],
        model: model?.id || -1,
        provider: "ollama",
        generated_by: newUserMessage.id,
        tools_used: (response as any).tools_used,
      },
    });

    const newAssistantMessage: AssistantMessage = {
      ...assistantPostData,
      type: "assistant",
    };
    setMessages((messages) => [...messages, newAssistantMessage]);
  };

  return (
    <div className="flex flex-col items-center relative h-full w-full">
      <div className="flex flex-col justify-between align-middle h-full z-10 relative w-full">
        {conversationLoading && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <HashLoader color="#484848" size={200} />
          </div>
        )}
        <div className="h-full w-full pt-4 overflow-y-scroll no-scrollbar">
          {!messages?.length && !conversationLoading && (
            <Welcome handleMessageSend={handleSendMessage} />
          )}
          {messages.map((message) =>
            isUserMessage(message) ? (
              <UserChatMessage
                key={`user-${message.id}`}
                userMessageData={message}
              />
            ) : isAssistantMessage(message) ? (
              <AssistantChatMessage
                key={`assistant-${message.id}`}
                assistantMessageData={message}
              />
            ) : null
          )}
          <div ref={ref} />
        </div>
        <ChatInput
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onModelChange={setModel}
          onImageDataChange={setImageData}
          selectedModel={model}
          models={models}
          modelsLoading={modelsLoading}
        />
        <div className="w-full flex justify-center items-center">
          <span className="text-muted-foreground text-xs italic">
            AI can make mistakes. Check important information.
          </span>
        </div>
      </div>
    </div>
  );
}
