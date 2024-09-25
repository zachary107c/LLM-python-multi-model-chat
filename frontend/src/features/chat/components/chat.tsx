import { useState, useEffect } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { ChatMessage } from '@/features/chatMessage/components/chat-message';
import { createUserMessage } from '@/features/chatMessage/api/create-user-message';
import { createAssistantMessage } from '@/features/chatMessage/api/create-assistant-message';
import { ConversationDetailMessage } from '@/types/api';
import { updateConversationMutation } from '@/features/conversation/api/update-conversation';
import { useGetConversationQuery } from '@/features/conversation/api/get-conversation';
import { Callout } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { HashLoader } from 'react-spinners';
import { createConversationMutation } from '@/features/conversation/api/create-conversation';
import { useGetModelsQuery } from '@/features/model/api/get-models';
import { useQueryClient } from '@tanstack/react-query';

interface ChatProps {
    chatId: string;
    onCreateNewChat: (newChatId: string) => void;
}

export function Chat({ chatId, onCreateNewChat }: ChatProps) {
    const [messages, setMessages] = useState<ConversationDetailMessage[]>([]);
    const [model, setModel] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const updateMutation = updateConversationMutation();
    const createMutation = createConversationMutation();

    const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
    const { data, error, isLoading: conversationLoading } = useGetConversationQuery({ conversationId: chatId });

    const ref = useScrollToEnd(messages);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (data) {
            const newMessages = data.messages.map((message: any) => ({
                type: message.type,
                content: message.content,
                id: message.id,
                createdAt: message.createdAt,
                liked: message.liked,
                model: message.model,
            }));
            setMessages(newMessages);
        } else if (!chatId) {
            setMessages([]);
        }
    }, [data]);

    useEffect(() => {
        if (models && models?.length > 0 && !model) {
            setModel(models[0].name);
        }
        if (modelsLoading) {
            console.log("modelsLoading");
        }
    }, [models]);

    useEffect(() => {
        if (chatId) {
            setMessages([]);
            queryClient.invalidateQueries({ queryKey: ["conversation", chatId] });
        }
    }, [chatId]);


    async function handleCreateNewConversation(firstMessage: string) {
        var response = await createMutation.mutateAsync({ data: { previousConversationId: chatId || undefined, data: { title: firstMessage } } });
        onCreateNewChat(response.id);
        return response.id;
    }

    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {

            var currentChatId = chatId;

            if (!chatId) {
                currentChatId = await handleCreateNewConversation(message);
            }

            const userPostData = await createUserMessage({ data: { conversation: currentChatId, content: message } });
            if (messages.length == 0) {
                await updateMutation.mutateAsync({ data: { conversationId: currentChatId, updates: { title: message } } });
            }
            setMessages(erm => [...erm, { content: userPostData.content, type: 'user', id: userPostData.id, createdAt: userPostData.createdAt, model: 'user' }]);
            setIsLoading(true);
            var payload = {
                model: model,
                messages: [{ role: "user", content: message }],
                stream: false,
            }
            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            setIsLoading(false);
            const assistantPostData = await createAssistantMessage({ data: { conversation: currentChatId, content: response.data.message.content, model: model, provider: "ollama" } });
            setMessages(erm => [...erm, { content: assistantPostData.content, type: 'assistant', id: assistantPostData.id, createdAt: assistantPostData.createdAt, model: assistantPostData.model }]);
        }
    }

    return (
        <div className='flex flex-col items-center relative'>
            <div className='flex flex-col justify-between align-middle h-screen w-[60%] z-10 relative'>
                {
                    conversationLoading && (
                        <div className='w-full h-full flex flex-col items-center justify-center'>
                            <HashLoader color='#484848' size={100} />
                        </div>
                    )
                }
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {
                        error && (<Callout.Root color='red' variant='surface'>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                Failed to get conversation {chatId}: {error.message}
                            </Callout.Text>
                        </Callout.Root>)
                    }
                    {messages.map((message) => (
                        <ChatMessage messageText={message.content} messageType={message.type} messageId={message.id} name={message.model ? message.model : ""} liked={message.liked} conversationId={chatId} />
                    ))}
                    {
                        (isLoading) && (
                            <div className='flex justify-start mb-4'>
                                <Panel title='LLM' justify='justify-start'>
                                    <ChatLoader />
                                </Panel>
                            </div>
                        )
                    }
                    <div ref={ref} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} onModelChange={setModel} selectedModel={model} models={models} modelsLoading={modelsLoading} />
            </div>
        </div>
    );
}
