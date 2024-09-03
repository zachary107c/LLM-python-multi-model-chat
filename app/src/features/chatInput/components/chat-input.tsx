import { TextField, TextArea, IconButton, Text, Button, Card, Popover, Box, Flex, Checkbox, Avatar } from '@radix-ui/themes';
import { RocketIcon, ChatBubbleIcon, FileIcon, ImageIcon, FileTextIcon } from '@radix-ui/react-icons';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface Props {
    onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: Props) {
    const [newMessage, setNewMessage] = useState('');
    const [newContext, setNewContext] = useState('');

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage(newMessage + '\n\n' + newContext);
        setNewMessage('');
        setNewContext('');
    };

    return (
        <div className='chat-input py-4'>
            <Card>
                <form onSubmit={handleSendMessage} className='flex justify-between items-center'>
                    <TextArea
                        size='1'
                        variant='surface'
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        placeholder='Type a message to the bot'
                        className='w-full mr-2'
                        rows={1}
                        resize="vertical"
                        radius="full"
                    />
                    <Button type='submit' size='4' variant='surface' color='jade'>
                        <Text size='2'>
                            Submit
                        </Text>
                        <RocketIcon />
                    </Button>
                </form>
            </Card>

        </div>
    );
};

