import { useEffect, useState } from "react";
import { AlertDialog, Flex, Button, Card, Skeleton } from "@radix-ui/themes";
import { Textarea } from '@/components/ui/textarea';
import { Button as LocalButton } from '@/components/ui/button';
import { Pencil2Icon, MagicWandIcon } from '@radix-ui/react-icons'; // Add this if not already imported
import { useSearchParams } from 'react-router-dom';
import { updateConversationMutation } from "../api/update-conversation";
import { useGenerateConversationTitle } from "@/features/conversation/hooks/generate-conversation-title";
import { BarLoader } from "react-spinners";


interface UpdateConversationModalProps {
    conversationId: string;
    currentTitle: string;
}

export function UpdateConversationModal({ conversationId, currentTitle }: UpdateConversationModalProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [newTitle, setNewTitle] = useState(currentTitle);
    const updateMutation = updateConversationMutation();
    const { generateConversationTitle, isLoading, error } = useGenerateConversationTitle(conversationId);


    useEffect(() => {
        setNewTitle(currentTitle);
    }, [currentTitle]);


    const handleUpdate = async (title: string) => {
        try {
            await updateMutation.mutateAsync({ data: { conversationId: conversationId, updates: { title: title } } });
        } catch (e) {
            console.log(e);
        }
    };

    const handleGenerateAiTitle = async () => {
        setNewTitle(await generateConversationTitle());
    }

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <LocalButton variant='ghost' className="p-2 w-full flex justify-start">
                    <Pencil2Icon className="mr-2" />
                    <div className="w-full">
                        Edit Conversation
                    </div>
                </LocalButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content size='1'>
                <AlertDialog.Title size='2'>Edit Conversation Title</AlertDialog.Title>
                <Card className='w-full flex justify-between items-center'
                    style={{
                        '--base-card-padding-top': 'var(--space-1)',
                        '--base-card-padding-bottom': 'var(--space-1)',
                        '--base-card-padding-left': 'var(--space-2)',
                        '--base-card-padding-right': 'var(--space-2)',
                    } as any} size="1" variant='surface'>

                    {
                        isLoading ? (
                            <div className="h-[48px] flex items-center">
                                <BarLoader height={4} width={"100%"} color="#484848" />
                            </div>
                        ) : (
                            <Textarea
                                className='mr-2 outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar'
                                onChange={(event: any) => setNewTitle(event.target.value)}
                                value={newTitle}
                                placeholder='Type your message here'
                            />
                        )
                    }
                    <div className="flex justify-end">
                        <LocalButton variant="ghost" onClick={async () => handleGenerateAiTitle()} className="p-3">
                            <MagicWandIcon color='yellow' />
                        </LocalButton>
                    </div>
                </Card>
                <Flex gap="3" mt="4" justify="between">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray" size='1'>
                            Close
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="green" onClick={() => handleUpdate(newTitle)} size='1'>
                            Update Conversation
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}