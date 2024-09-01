import { useState } from 'react';
import axios from 'axios';
import { TextArea, Button } from '@radix-ui/themes';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { HollowDotsSpinner } from 'react-epic-spinners';
import Panel from '../panel';

interface Message {
    text: string;
    type: 'user' | 'llm';
}


function ChatBot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSendMessage(event: any) {
        event.preventDefault();
        if (newMessage.trim().length > 0) {
            setMessages([...messages, { text: newMessage, type: 'user' }]);
            setNewMessage('');
            setIsLoading(true);
            const response = await axios.post('http://192.168.1.11:11434/api/chat', {
                model: "Jade",
                messages: [{ role: "user", content: newMessage }],
                stream: false
            });
            setIsLoading(false);
            setMessages([...messages, { text: newMessage, type: 'user' }, { text: response.data.message.content, type: 'llm' }]);
        }
    }

    return (
        <div className='flex flex-col justify-between h-full'>
            <div className='my-4 overflow-y-scroll no-scrollbar'>
                {messages.map((message, index) => (
                    message.type === 'user' ? (
                        <div className='flex justify-between'>
                            <div  className='mr-96'></div>
                            <Panel>
                                {message.text}
                            </Panel>
                        </div>
                    ) : (
                        <div className='flex justify-between'>
                            <Panel>
                                {message.text}
                            </Panel>
                            <div className='ml-96'></div>
                        </div>
                    )
                ))}
                {
                    (isLoading) && (<HollowDotsSpinner />)
                }
            </div>
            <div className='my-4'>
                <form onSubmit={handleSendMessage} className='flex justify-between'>
                    <TextArea
                        size='1'
                        value={newMessage}
                        onChange={(event) => setNewMessage(event?.target.value)}
                        placeholder='Type a message to the bot...'
                        className='w-full mr-2'
                    />
                    <Button type='submit'><PaperPlaneIcon /></Button>
                </form>
            </div>
        </div>
    );
}

export default ChatBot;
