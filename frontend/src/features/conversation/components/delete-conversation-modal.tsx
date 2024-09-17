import { AlertDialog, Flex, Button } from "@radix-ui/themes";
import { Button as LocalButton  } from '@/components/ui/button';
import { TrashIcon } from '@radix-ui/react-icons'; // Add this if not already imported
import { useSearchParams } from 'react-router-dom';

interface DeleteConversationModalProps {
    conversationId: string;
    deleteMutation: any;
}

export function DeleteConversationModal({ conversationId, deleteMutation }: DeleteConversationModalProps) {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync({ data: { conversationId } });
            setSearchParams({});
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <LocalButton variant={"ghost-no-hover"} className="mx-1 px-1 py-0 my-0">
                    <TrashIcon />
                </LocalButton>
            </AlertDialog.Trigger>
            <AlertDialog.Content size='1'>
                <AlertDialog.Title size='2'>Delete Conversation</AlertDialog.Title>
                <AlertDialog.Description size="1">
                    Are you sure? This conversation will no longer be accessible.
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="between">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray" size='1'>
                            Cancel
                        </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button variant="solid" color="red" onClick={handleDelete} size='1'>
                            Delete Conversation
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}