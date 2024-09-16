import { useState, useEffect } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { ChatMessage } from '@/features/chatMessage/components/chat-message';
import { createUserMessage } from '@/features/chatMessage/api/create-user-message';
import { createAssistantMessage } from '@/features/chatMessage/api/create-assistant-message';
import { getConversation } from '@/features/chatHistory/api/get-conversation';
import { ConverstaionDetailMessage } from '@/types/api';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateConversation } from '@/features/chatHistory/api/update-conversation';


export function Chat({ chatId }: any) {
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState<ConverstaionDetailMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useScrollToEnd(messages);


    // Create a new conversation
    const { mutateAsync: updateConversationMutation } = useMutation({
        mutationFn: updateConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });


    useEffect(() => {
        const fetchChatMessages = async () => {
            const response = await getConversation({ conversationId: chatId });
            setMessages(response.messages.map((message) => ({ type: message.type, content: message.content, id: message.id, createdAt: message.createdAt })));
        };

        if (chatId) {
            fetchChatMessages();
        }
    }, [chatId]);

    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {
            const userPostData = await createUserMessage({ data: { conversation: chatId, content: message } });
            if (messages.length == 0) {
                await updateConversationMutation({ conversationId: chatId, data: { title: message } });
            }
            setMessages(erm => [...erm, { content: userPostData.content, type: 'user', id: userPostData.id, createdAt: userPostData.createdAt }]);
            setIsLoading(true);
            var payload = {
                model: "llama3.1",
                messages: [{ role: "user", content: message }],
                stream: false,
            }
            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            setIsLoading(false);
            const assistantPostData = await createAssistantMessage({ data: { conversation: chatId, content: response.data.message.content, model: "llama3.1", provider: "ollama" } });
            setMessages(erm => [...erm, { content: assistantPostData.content, type: 'assistant', id: assistantPostData.id, createdAt: assistantPostData.createdAt }]);
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col justify-between align-middle h-screen w-[60%]'>
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {messages.map((message, index) => (
                        <ChatMessage messageText={message.content} messageType={message.type} messageId={message.id} />
                    ))}
                    {
                        (isLoading) && (
                            <div className='flex justify-start'>
                                <Panel title='LLM' justify='justify-start'>
                                    <ChatLoader />
                                </Panel>
                            </div>
                        )
                    }
                    <div ref={ref} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
