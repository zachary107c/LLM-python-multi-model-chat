import { useState } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { ChatMessage } from '@/features/chatMessage/components/chat-message';

export interface Message {
    text: string;
    type: 'user' | 'llm';
}


export function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useScrollToEnd(messages);

    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {
            setMessages([...messages, { text: message, type: 'user' }]);
            setIsLoading(true);
            var payload = {
                model: "llama3.1",
                messages: [{ role: "user", content: message }],
                stream: false,
            }

            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);

            setIsLoading(false);
            setMessages([...messages, { text: message, type: 'user' }, { text: response.data.message.content, type: 'llm' }]);
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col justify-between h-screen w-[60%]'>
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {messages.map((message, index) => (
                        <ChatMessage messageText={message.text} messageType={message.type} />
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
