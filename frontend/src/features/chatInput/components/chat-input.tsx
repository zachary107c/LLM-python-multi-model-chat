import { Text, Button, Card, DropdownMenu, Skeleton, Badge } from '@radix-ui/themes';
import { RocketIcon, FileIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Textarea } from '@/components/ui/textarea';
import { useState, useCallback } from 'react';
import { Model } from '@/types/api';
import { Button as LocalButton } from '@/components/ui/button';
import { ImageUploadButton } from '@/features/imageUpload/components/image-upload-button';

interface Props {
    onSendMessage: (message: string, image: File | null) => void;
    onModelChange: (model: string) => void;
    onImageDataChange: (model: File | null ) => void;
    selectedModel: string;  // Pass selected model from parent
    models: Model[] | undefined;  // Pass models array from parent
    modelsLoading: boolean;
}

export function ChatInput({ onSendMessage, onModelChange, onImageDataChange, selectedModel, models, modelsLoading }: Props) {
    const [newMessage, setNewMessage] = useState('');
    const [textAreaHeight, setTextAreaHeight] = useState(48);
    const [lastMessage, setLastMessage] = useState('');
    const [imageName, setImageName] = useState<string | null>(null);
    const [imageData, setImageData] = useState<File | null>(null);


    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage(newMessage, imageData);
        setLastMessage(newMessage);
        setNewMessage('');
        setTextAreaHeight(48);
    };

    const handleKeyDown = (event: any) => {
        if (event.shiftKey && event.key === 'Enter') {
            setTextAreaHeight(Math.min(textAreaHeight + 24, 240)); // Limit expansion to 240px
        }
        else if (event.key === 'Enter') {
            event.preventDefault();
            onSendMessage(newMessage, imageData);
            setLastMessage(newMessage);
            setNewMessage('');
            setTextAreaHeight(48);
        } else if (event.key === 'Backspace' && textAreaHeight > 48) {
            if (newMessage.endsWith('\n')) {
                setTextAreaHeight(Math.max(textAreaHeight - 24, 48));
            }
        }
    };

    function handleModelChange(model: string) {
        onModelChange(model);
    }

    const handleFileChange = useCallback((newFile: File | null) => {
        onImageDataChange(newFile);
        setImageData(newFile)
        setImageName(newFile ? newFile.name : null)
    }, [])

    const handleClear = useCallback(() => {
        onImageDataChange(null);
        setImageData(null)
        setImageName(null)
    }, [])

    const handleOuterClear = () => {
        handleClear()
        console.log('File cleared from parent component')
    }

    return (
        <div className='chat-input mb-4 flex flex-col w-full'>
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
                        <div className='flex flex-col w-full'>
                            <Textarea
                                className='mr-2 outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar'
                                onChange={(event) => setNewMessage(event.target.value)}
                                value={newMessage}
                                placeholder='Type your message here'
                                onKeyDown={handleKeyDown}
                                style={{ height: `${textAreaHeight}px` }}
                            />
                            <div className='flex justify-between items-center'>
                                <div className='mr-2'>
                                    <div className='flex items-center'>
                                        <DropdownMenu.Root>
                                            <DropdownMenu.Trigger>
                                                <Button variant="surface" size='1'>
                                                    {modelsLoading ? (
                                                        <Skeleton width='60px' />
                                                    ) : (
                                                        selectedModel || "Select a model"
                                                    )}

                                                    <DropdownMenu.TriggerIcon />
                                                </Button>
                                            </DropdownMenu.Trigger>
                                            <DropdownMenu.Content>
                                                {models?.map((model) => (
                                                    <DropdownMenu.Item onClick={() => handleModelChange(model.name)}>{model.name}</DropdownMenu.Item>
                                                ))}
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>
                                        <div className='mx-2'>
                                            <LocalButton variant='ghost-no-hover' className='m-1 p-0'>
                                                <FileIcon />
                                            </LocalButton>
                                        </div>
                                        {imageName ? null : <div>
                                            <ImageUploadButton fileName={imageName} onFileChange={handleFileChange} onClear={handleClear} />
                                        </div>}
                                        {imageName ?
                                            <div>
                                                <Badge radius='full' variant='surface' color='mint'>
                                                    <div className='w-full flex justify-between items-center px-2'>
                                                        <Text weight='light' size='1'>{imageName}</Text>
                                                        <LocalButton size='tiny' variant='ghost-no-hover' className='h-6' onClick={handleOuterClear}>
                                                            <Cross1Icon height={10} width={10} />
                                                        </LocalButton>
                                                    </div>
                                                </Badge>
                                            </div> : null}
                                    </div>
                                </div>
                                <Button type='submit' size='1' variant='surface' color='green'>
                                    <Text size='1'>
                                        Submit
                                    </Text>
                                    <RocketIcon />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
};

