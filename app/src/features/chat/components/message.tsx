import { useState } from 'react';
import axios from 'axios';
import { TextArea, Button, IconButton, Card, Separator, Badge, Switch, Text, Flex } from '@radix-ui/themes';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { BarLoader } from 'react-spinners';
import Panel from '@/components/ui/panel';

export interface Message {
    text: string;
    type: 'user' | 'llm';
}

export function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [context, setContext] = useState([]);
    const [contextEnabled, setContextEnabled] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const ref = useScrollToEnd(messages);

    async function handleSendMessage(event: any) {
        event.preventDefault();
        if (newMessage.trim().length > 0) {
            setMessages([...messages, { text: newMessage, type: 'user' }]);
            setNewMessage('');
            setIsLoading(true);
            var payload = {
                model: "Jade",
                // messages: [{ role: "user", content: newMessage }],
                prompt: newMessage,
                stream: false,
                context: null
            }
            if (contextEnabled) {
                if (context && context.length > 0) {
                    payload.context = context;
                }
            }
            const response = await axios.post('http://192.168.1.11:11434/api/generate', payload);

            if (contextEnabled) {
                setContext(response.data.context)
            } else {
                console.log(contextEnabled)
            }

            setIsLoading(false);
            setMessages([...messages, { text: newMessage, type: 'user' }, { text: response.data.response, type: 'llm' }]);
        }
    }

    function handleContextToggle(event: any) {
        console.log((event.target.value === 'on'))
        setContextEnabled((event.target.value === 'on'))
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col justify-between h-screen w-[65%]'>
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {messages.map((message, index) => (
                        message.type === 'user' ? (
                            <div className='flex justify-end'>
                                <div>
                                    <Panel title='You' text={message.text} role={message.type} />
                                </div>
                            </div>
                        ) : (
                            <div className='flex justify-start'>
                                <div>
                                    <Panel title='LLM' text={message.text} role={message.type} />
                                </div>
                            </div>
                        )
                    ))}
                    {
                        (isLoading) && (
                            <div className='flex justify-start'>
                                <div>
                                    <Panel title='LLM' justify='justify-start'>
                                        <BarLoader color='#197CAE' />
                                    </Panel>
                                </div>
                                <div className='ml-96'></div>
                            </div>
                        )
                    }
                    <div ref={ref} />
                </div>
                <div className='my-4'>
                    <form onSubmit={handleSendMessage} className='flex justify-between'>
                        <div className='mr-2'>
                            <div className='flex flex-col'>
                                <div className='mb-1'>
                                    <Switch size="1" onClick={(event) => { handleContextToggle(event) }} />
                                </div>
                                Context
                            </div>
                        </div>
                        <TextArea
                            size='1'
                            variant='surface'
                            value={newMessage}
                            onChange={(event) => setNewMessage(event?.target.value)}
                            placeholder='Type a message to the bot'
                            className='w-full mr-2'
                        />
                        <IconButton type='submit' size='4' variant='surface'><PaperPlaneIcon /></IconButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
