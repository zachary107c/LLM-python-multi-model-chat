import { TextArea, IconButton, Text, Button } from '@radix-ui/themes';
import { RocketIcon } from '@radix-ui/react-icons';
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
        <div className='mt-2 pb-2'>
            <form onSubmit={handleSendMessage} className='flex justify-between'>
                <TextArea
                    size='1'
                    variant='surface'
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder='Type a message to the bot'
                    className='w-full mr-2'
                />
                <Button type='submit' size='2' variant='surface'>
                    <Text size='1'>
                        Submit
                    </Text>
                    <RocketIcon string={'Submit'} />
                </Button>
            </form>
        </div>
    );
};

