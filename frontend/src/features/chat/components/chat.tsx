import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { env } from "@/config/env";
import Cookies from "js-cookie";
import useScrollToEnd from "@/features/chat/hooks/use-scroll-to-end";
// import { ChatLoader } from "@/features/chatLoader/components/chat-loader";
// import Panel from "@/components/ui/panel";
import { ChatInput } from "@/features/chatInput/components/chat-input";
import { createUserMessage } from "@/features/chatMessage/api/create-user-message";
import { createAssistantMessage } from "@/features/chatMessage/api/create-assistant-message";
import { updateConversationMutation } from "@/features/conversation/api/update-conversation";
import { useGetConversationQuery } from "@/features/conversation/api/get-conversation";
import { Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
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
  Suggestion,
} from "@/types/api";
import { Welcome } from "@/features/welcome/components/welcome";
import { WelcomeLoading } from "@/features/welcome/components/welcome-loading";
import { useGetSuggestionsQuery } from "../../welcome/api/get-three-suggestions";
import { useSearchParams } from "react-router-dom";
import { useUserSettings } from "@/components/userSettings/user-settings-provider";
import { useToast } from "@/components/ui/toast/toast-provider";

interface ChatProps {
  chatId: string;
  onCreateNewChat: (newChatId: string) => void;
}

export function Chat({ chatId, onCreateNewChat }: ChatProps) {
  const { addToast } = useToast();
  const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>(
    []
  );
  const [model, setModel] = useState<BaseModelEntity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageData, setImageData] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [_, setSearchParams] = useSearchParams();
  const { userSettings, setUserSettings } = useUserSettings();

  const updateMutation = updateConversationMutation();
  const createMutation = createConversationMutation();

  const { data: suggestionsData, isLoading: suggestionsLoading } =
    useGetSuggestionsQuery(3);
  const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
  const {
    data,
    error,
    isLoading: conversationLoading,
  } = useGetConversationQuery({ conversationId: chatId });

  const ref = useScrollToEnd(messages);

  const queryClient = useQueryClient();

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
          } as AssistantMessage;
        }
      });
      setMessages(newMessages);
    } else {
      setMessages([]);
    }

    if (!chatId) {
      setMessages([]);
    }
  }, [data]);

  useEffect(() => {
    if (models && models.length > 0 && !model) {
      const preferredModel = models.find(
        (m) =>
          m.name ===
          ((userSettings.settings.preferred_model &&
            userSettings.settings.preferred_model.name) ||
            "llama3.1:latest")
      );
      setModel(preferredModel ? preferredModel : models[0]);
    }
  }, [models, model]);

  useEffect(() => {
    if (
      suggestionsData &&
      suggestionsData.suggestions &&
      suggestionsData.suggestions.length > 0 &&
      !suggestionsLoading
    ) {
      setSuggestions(suggestionsData.suggestions);
    }
  }, [suggestionsData]);

  useEffect(() => {
    if (chatId) {
      queryClient.invalidateQueries({ queryKey: ["conversation", chatId] });
    }
  }, [chatId]);

  useEffect(() => {
    if (error) {
      addToast('Failed to get conversation!', "error");
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
        previousConversationId: chatId || undefined,
        data: { title: firstMessage },
      },
    });
    onCreateNewChat(response.id);
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
      let currentChatId = chatId;
      let shouldAddMessageManually = true;

      if (!chatId) {
        currentChatId = await handleCreateNewConversation(message);
        shouldAddMessageManually = false; // Don't manually add message for new conversations
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
        model: model?.name,
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
        }
      } else {
        payload.messages[0].content = message;
      }

      try {
        if (userSettings.settings?.stream_responses || false) {
          const response = await fetch(`${env.BACKEND_API_URL}chat/stream/`, {
            method: "POST",
            headers: {
              Authorization: `Token ${Cookies.get("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          let accumulatedContent = "";

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
          };

          setMessages((messages) => {
            if (messages[messages.length - 1]?.id === "temp") {
              return [...messages.slice(0, -1), finalAssistantMessage];
            }
            return [...messages, finalAssistantMessage];
          });
        } else {
          const response = await api.post("/chat/", payload, {
            headers: {
              Authorization: `Token ${Cookies.get("token")}`,
            },
          });

          const assistantPostData = await createAssistantMessage({
            data: {
              conversation: currentChatId,
              content_variations: [(response as any).message.content],
              model: model?.id || -1,
              provider: "ollama",
              generated_by: newUserMessage.id,
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
          };

          setMessages((messages) => [...messages, newAssistantMessage]);
          console.log(messages);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="flex flex-col items-center relative">
      <div className="flex flex-col justify-between align-middle h-screen w-[80%] z-10 relative">
        {conversationLoading && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <HashLoader color="#484848" size={200} />
          </div>
        )}
        <div className="h-full pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar">
          {error && (
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text>
                Failed to get conversation {chatId}: {error.message}
              </Callout.Text>
            </Callout.Root>
          )}
          {(!messages || messages.length == 0) &&
            suggestionsLoading &&
            !conversationLoading && <WelcomeLoading />}
          {(!messages || messages.length == 0) &&
            !suggestionsLoading &&
            !conversationLoading && (
              <Welcome
                suggestions={suggestions}
                handleMessageSend={handleSendMessage}
              />
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
      </div>
    </div>
  );
}
