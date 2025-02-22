import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import useScrollToEnd from "../hooks/use-scroll-to-end";
import { ChatInput } from "@/features/chatInput/components/chat-input";
import { createUserMessage } from "@/features/chatMessage/api/create-user-message";
import { createAssistantMessage } from "@/features/chatMessage/api/create-assistant-message";
import { updateConversationMutation } from "@/features/conversation/api/update-conversation";
import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import { HashLoader } from "react-spinners";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { useQueryClient } from "@tanstack/react-query";
import { UserChatMessage } from "@/features/chatMessage/components/user-chat-message";
import { AssistantChatMessage } from "@/features/chatMessage/components/assistant-chat-message";
import {
  UserMessage,
  AssistantMessage,
  BaseModelEntity,
  Message,
} from "@/types/api";
import { Welcome } from "@/features/suggestions/components/welcome";
import { WelcomeLoading } from "@/features/suggestions/components/welcome-loading";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@/lib/auth";
import { useConversationId } from "@/features/conversation/contexts/conversationContext";
import { useToast } from "@/hooks/use-toast";

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
  } = useGetConversationQuery({ conversationId: conversationId });

  const ref = useScrollToEnd(messages);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  useEffect(() => {
    if (data) {
      const newMessages = data.messages.map((message: any) => {
        if (message.type === "user") {
          return {
            type: message.type,
            content: message.content,
            id: message.id,
            created_at: message.created_at,
            liked: message.liked,
            conversation: message.conversation,
            image: message.image,
            is_deleted: message.is_deleted,
            deleted_at: message.deleted_at,
            recoverable: message.recoverable,
          } as UserMessage;
        } else {
          return {
            type: message.type,
            id: message.id,
            created_at: message.created_at,
            model: message.model,
            provider: message.provider,
            content_variations: message.content_variations,
            generated_by: message.generated_by,
            liked: message.liked,
            conversation: message.conversation,
            is_deleted: message.is_deleted,
            deleted_at: message.deleted_at,
            recoverable: message.recoverable,
            tools_used: message.tools_used,
          } as AssistantMessage;
        }
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
          ((userSettings.data?.settings.preferred_model &&
            userSettings.data?.settings.preferred_model.name) ||
            "llama3.1:latest")
      );
      setModel(preferredModel ? preferredModel : models[0]);
    }
  }, [models, model]);

  useEffect(() => {
    if (conversationId) {
      console.log("conversation id changed!", conversationId);
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

  function isUserMessage(message: Message): message is UserMessage {
    return message.type === "user";
  }

  function isAssistantMessage(message: Message): message is AssistantMessage {
    return message.type === "assistant";
  }

  async function handleCreateNewConversation(firstMessage: string) {
    var response = await createMutation.mutateAsync({
      data: {
        previousConversationId: conversationId || undefined,
        data: { title: firstMessage },
      },
    });
    setConversationId(response.id);
    return response.id;
  }

  const toDataURL = async (
    url: string | null
  ): Promise<{ base64: string; type: string } | null> => {
    if (!url) return null;

    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<{ base64: string; type: string }>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = reader.result as string;

        // Extract the MIME type and base64 string
        const [header, base64String] = base64Data.split(",");
        const typeMatch = header.match(/:(.*?);/);

        if (typeMatch) {
          const mimeType = typeMatch[1];
          resolve({ base64: base64String, type: mimeType });
        } else {
          reject(new Error("Failed to extract MIME type"));
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  async function handleSendMessage(message: string, useTools: boolean) {
    if (message.trim().length > 0) {
      let currentChatId = conversationId;

      let shouldAddMessageManually = true;

      if (!conversationId) {
        currentChatId = await handleCreateNewConversation(message);
        shouldAddMessageManually = false;
      }

      const userPostData = await createUserMessage({
        data: {
          conversation: currentChatId,
          content: message,
          image: imageData,
        },
      });

      if (messages.length === 0) {
        await updateMutation.mutateAsync({
          data: { conversationId: currentChatId, updates: { title: message } },
        });
      }

      const newUserMessage: UserMessage = {
        id: userPostData.id,
        created_at: userPostData.created_at,
        content: userPostData.content,
        conversation: userPostData.conversation,
        image: userPostData.image,
        type: "user",
        is_deleted: userPostData.is_deleted,
        deleted_at: userPostData.deleted_at,
        recoverable: userPostData.recoverable,
      };

      if (shouldAddMessageManually) {
        setMessages((messages) => [...messages, newUserMessage]);
      }

      setIsLoading(true);

      const image_data = await toDataURL(userPostData.image);
      const payload = {
        model: model?.model,
        provider: model?.provider,
        conversation: currentChatId,
        useTools: useTools,
        messages: [
          {
            role: "user",
            content: "",
          } as { role: string; content: string | any[]; images?: string[] },
        ],
      };

      if (image_data) {
        if (model?.provider === "ollama") {
          payload.messages[0]["images"] = [image_data.base64];
          payload.messages[0].content = message;
        } else if (model?.provider === "openai") {
          let text_part = { type: "text", text: message };
          let image_part = {
            type: "image_url",
            image_url: {
              url: `data:${image_data.type};base64,${image_data.base64}`,
            },
          };
          payload.messages[0].content = [text_part, image_part];
        } else if (model?.provider === "anthropic") {
          let text_part = { type: "text", text: message };
          let image_part = {
            type: "image",
            source: {
              type: "base64",
              media_type: image_data.type,
              data: image_data.base64,
            },
          };
          payload.messages[0].content = [text_part, image_part];
        }
      } else {
        payload.messages[0].content = message;
      }

      try {
        if (userSettings.data?.settings?.stream_responses || false) {
          const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          let accumulatedContent = "";
          let tools_used: any = null;

          const stream = new ReadableStream({
            start(controller) {
              const reader = response.body?.getReader();
              return pump();

              function pump(): any {
                return reader?.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }

                  const decoded = new TextDecoder().decode(value);
                  const lines = decoded.split("\n");

                  for (const line of lines) {
                    if (line.trim()) {
                      try {
                        const jsonStr = line.slice(6); // Remove "data: " prefix
                        const data = JSON.parse(jsonStr);

                        if (data.message && data.message.error) {
                          throw new Error(data.message.error);
                        }

                        if (data.message?.content) {
                          accumulatedContent += data.message.content;

                          if (tools_used == null) {
                            tools_used = data.tools_used;
                          }

                          const tempAssistantMessage: AssistantMessage = {
                            id: "temp",
                            created_at: new Date().toISOString(),
                            content_variations: [
                              { id: -1, content: accumulatedContent },
                            ],
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
                            if (lastMessage?.id === "temp") {
                              return [
                                ...messages.slice(0, -1),
                                tempAssistantMessage,
                              ];
                            }
                            return [...messages, tempAssistantMessage];
                          });
                        }
                      } catch (e) {
                        console.error("Error parsing chunk:", e);
                      }
                    }
                  }
                  return pump();
                });
              }
            },
          });

          await new Response(stream).text();

          const assistantPostData = await createAssistantMessage({
            data: {
              conversation: currentChatId,
              content_variations: [accumulatedContent],
              model: model?.id || -1,
              provider: model?.provider || "ollama",
              generated_by: newUserMessage.id,
              tools_used: tools_used,
            },
          });

          const finalAssistantMessage: AssistantMessage = {
            id: assistantPostData.id,
            created_at: assistantPostData.created_at,
            content_variations: assistantPostData.content_variations,
            generated_by: newUserMessage,
            conversation: assistantPostData.conversation,
            model: assistantPostData.model,
            provider: assistantPostData.provider,
            liked: assistantPostData.liked,
            type: "assistant",
            is_deleted: assistantPostData.is_deleted,
            deleted_at: assistantPostData.deleted_at,
            recoverable: assistantPostData.recoverable,
            tools_used: assistantPostData.tools_used,
          };

          setMessages((messages) => {
            if (messages[messages.length - 1]?.id === "temp") {
              return [...messages.slice(0, -1), finalAssistantMessage];
            }
            return [...messages, finalAssistantMessage];
          });
        } else {
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
            id: assistantPostData.id,
            created_at: assistantPostData.created_at,
            content_variations: assistantPostData.content_variations,
            generated_by: newUserMessage,
            conversation: assistantPostData.conversation,
            model: assistantPostData.model,
            provider: assistantPostData.provider,
            liked: assistantPostData.liked,
            type: "assistant",
            is_deleted: assistantPostData.is_deleted,
            deleted_at: assistantPostData.deleted_at,
            recoverable: assistantPostData.recoverable,
            tools_used: assistantPostData.tools_used,
          };

          setMessages((messages) => [...messages, newAssistantMessage]);
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
    }
  }

  return (
    <div className="flex flex-col items-center relative h-full w-full">
      <div className="flex flex-col justify-between align-middle h-full z-10 relative w-full">
        {conversationLoading && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <HashLoader color="#484848" size={200} />
          </div>
        )}
        <div className="h-full w-full pt-4 overflow-y-scroll no-scrollbar">
          {((!messages || messages.length == 0) && !conversationLoading) && (
            <Welcome handleMessageSend={handleSendMessage} />
          )}
          {messages.map((message) => {
            if (isUserMessage(message)) {
              return (
                <UserChatMessage
                  key={"user-" + message.id}
                  userMessageData={message}
                />
              );
            } else if (isAssistantMessage(message)) {
              return (
                <AssistantChatMessage
                  key={"assistant-" + message.id}
                  assistantMessageData={message}
                />
              );
            } else {
              return null;
            }
          })}
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
