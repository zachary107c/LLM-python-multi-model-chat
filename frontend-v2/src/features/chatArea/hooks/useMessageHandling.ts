import { useCallback } from "react";
import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import { createUserMessage } from "@/features/chatMessage/api/create-user-message";
import { createAssistantMessage } from "@/features/chatMessage/api/create-assistant-message";
import { updateConversationMutation } from "@/features/conversation/api/update-conversation";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useToast } from "@/hooks/use-toast";
import { UserMessage, AssistantMessage, BaseModelEntity } from "@/types/api";

interface UseMessageHandlingProps {
  conversationId: string;
  setConversationId: (id: string) => void;
  model: BaseModelEntity | null;
  messages: (UserMessage | AssistantMessage)[];
  setMessages: React.Dispatch<React.SetStateAction<(UserMessage | AssistantMessage)[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  imageData: File | null;
  userSettings: any;
}

export function useMessageHandling({
  conversationId,
  setConversationId,
  model,
  messages,
  setMessages,
  setIsLoading,
  imageData,
  userSettings
}: UseMessageHandlingProps) {
  const updateMutation = updateConversationMutation();
  const createMutation = createConversationMutation();
  const { toast } = useToast();

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

              setMessages((prevMessages) => {
                const lastMessage = prevMessages[prevMessages.length - 1];
                return lastMessage?.id === "temp"
                  ? [...prevMessages.slice(0, -1), tempAssistantMessage]
                  : [...prevMessages, tempAssistantMessage];
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
    
    setMessages((prevMessages) =>
      prevMessages[prevMessages.length - 1]?.id === "temp"
        ? [...prevMessages.slice(0, -1), finalAssistantMessage]
        : [...prevMessages, finalAssistantMessage]
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
    setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
  };

  const handleSendMessage = useCallback(async (message: string, useTools: boolean) => {
    if (message.trim().length === 0) return;

    let currentChatId = conversationId;
    let shouldAddMessageManually = true;

    if (!conversationId) {
      currentChatId = await handleCreateNewConversation(message);
      shouldAddMessageManually = false;
    }

    const userPostData = await createUserMessage({
      data: { conversation: currentChatId, content: message, image: imageData, use_tools: useTools },
    });

    if (messages.length === 0) {
      await updateMutation.mutateAsync({
        data: { conversationId: currentChatId, updates: { title: message } },
      });
    }

    const newUserMessage: UserMessage = { ...userPostData, type: "user" };

    if (shouldAddMessageManually) {
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    }

    setIsLoading(true);

    const image_data = await toDataURL(userPostData.image);
    const payload = {
      conversation: conversationId,
      model: model?.model,
      provider: model?.provider,
      use_tools: useTools,
      message: {
        content: message,
        role: "user",
        images: image_data
          ? [
              {
                type: image_data?.type,
                data: image_data?.base64,
              },
            ]
          : [],
      },
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
  }, [conversationId, model, imageData, userSettings.data?.settings?.stream_responses, messages.length]);

  return {
    handleSendMessage,
  };
}