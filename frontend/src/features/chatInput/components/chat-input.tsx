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
    const [textAreaHeight, setTextAreaHeight] = useState(48);
    const [lastMessage, setLastMessage] = useState('');

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage(newMessage + '\n\n' + newContext);
        setLastMessage(newMessage);
        setNewMessage('');
        setNewContext('');
        setTextAreaHeight(48);
    };

    const handleKeyDown = (event: any) => {
        if (event.shiftKey && event.key === 'Enter') {
            setTextAreaHeight(Math.min(textAreaHeight + 24, 240)); // Limit expansion to 240px
        }    
        else if (event.key === 'Enter') {
            event.preventDefault();
            onSendMessage(newMessage);
            setLastMessage(newMessage);
            setNewMessage('');
            setNewContext('');
            setTextAreaHeight(48);
        } else if (event.key === 'Backspace' && textAreaHeight > 48) {
            if (newMessage.endsWith('\n')) {
                setTextAreaHeight(Math.max(textAreaHeight - 24, 48));
            }
        }
    };

    return (
        <div className='chat-input my-4'>
            <form onSubmit={handleSendMessage} className='flex justify-between'>
                <Card
                    className='w-full'
                    style={{
                        '--base-card-padding-top': 'var(--space-1)',
                        '--base-card-padding-bottom': 'var(--space-1)',
                        '--base-card-padding-left': 'var(--space-2)',
                        '--base-card-padding-right': 'var(--space-2)',
                    } as any} size="1" variant='surface'>
                    <div className='flex justify-between items-center h-full'>
                        <Textarea
                            className='mr-2 outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar'
                            onChange={(event) => setNewMessage(event.target.value)}
                            value={newMessage}
                            placeholder='Type your message here'
                            onKeyDown={handleKeyDown}
                            style={{ height: `${textAreaHeight}px` }}
                        />
                        <div className='flex items-end'>
                            <Button type='submit' size='2' variant='surface' color='green'>
                                <Text size='2'>
                                    Submit
                                </Text>
                                <RocketIcon />
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
};

