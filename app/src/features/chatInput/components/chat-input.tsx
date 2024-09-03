import { TextField, TextArea, IconButton, Text, Button, Card } from '@radix-ui/themes';
import { RocketIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

interface Props {
    onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: Props) {
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage(newMessage);
        setNewMessage('');
    };

    return (
        <div className='chat-input py-4'>
            <Card>
                <form onSubmit={handleSendMessage} className='flex justify-between items-center'>
                    <TextField.Root
                        size='2'
                        variant='surface'
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder='Type a message to the bot'
                        className='w-full mr-2'
                    >
                        <TextField.Slot>
                            <ChatBubbleIcon />
                        </TextField.Slot>
                    </TextField.Root>
                    {/* <TextArea
                        size='1'
                        variant='surface'
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder='Type a message to the bot'
                        className='w-full mr-2'
                    /> */}
                    <Button type='submit' size='2' variant='surface'>
                        <Text size='2'>
                            Submit
                        </Text>
                        {/* <RocketIcon string={'Submit'} /> */}
                    </Button>
                </form>
            </Card>

        </div>
    );
};

