import { useState, useEffect } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { ChatMessage } from '@/features/chatMessage/components/chat-message';

export interface Message {
    text: string;
    type: 'user' | 'assistant';
    id: number;
}


export function Chat({ token, chatId }: any) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useScrollToEnd(messages);


    useEffect(() => {
        const fetchChatMessages = async () => {
            const response = await axios.get(`http://127.0.0.1:8000/api/v1/conversations/${chatId}`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            const data = await response.data;
            setMessages(data.messages.map((message) => ({ type: message.type, text: message.content, id: message.id })));
        };

        if (chatId) {
            fetchChatMessages();
        }
    }, [chatId]);

    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {
            const userPost = await axios.post('http://127.0.0.1:8000/api/v1/messages/user/', { conversation: chatId, content: message }, {
                headers: {
                    Authorization: `Token ${token}`
                },
            });
            setMessages([...messages, { text: message, type: 'user', id: userPost.data.id }]);
            setIsLoading(true);
            var payload = {
                model: "llama3.1",
                messages: [{ role: "user", content: message }],
                stream: false,
            }
            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            setIsLoading(false);
            const assistantPost = await axios.post('http://127.0.0.1:8000/api/v1/messages/assistant/', { conversation: chatId, content: response.data.message.content, model: "llama3.1", provider: "ollama" }, {
                headers: {
                    Authorization: `Token ${token}`
                },
            });
            setMessages([...messages, { text: response.data.message.content, type: 'assistant', id: assistantPost.data.id }]);
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col justify-between h-screen w-[60%]'>
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {messages.map((message, index) => (
                        <ChatMessage messageText={message.text} messageType={message.type} messageId={message.id} token={token} />
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
