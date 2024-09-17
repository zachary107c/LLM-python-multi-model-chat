import Panel from "@/components/ui/panel"
import { TrashIcon, HeartIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { deleteUserMessageMutation } from "@/features/chatMessage/api/delete-user-message";
import { Flex } from "@radix-ui/themes";


export function ChatMessage({ messageText, messageType, messageId, conversationId }: { messageText: string, messageType: string, messageId: string, conversationId: string }) {
    const deleteUserMutation = deleteUserMessageMutation({ conversationId: conversationId });
    const deleteAssistantMutation = deleteAssistantMessageMutation({ conversationId: conversationId });

    return (
        <div className="mb-2">
            <div>
                <Panel title={messageType === 'user' ? 'You' : 'LLM'} text={messageText} role={messageType} />
            </div>
            <div className={messageType === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <Flex gap="0" align="center">
                    <Button variant='ghost' size={'icon'} onClick={async () => messageType === 'user' ? await deleteUserMutation.mutateAsync({ data: { messageId: messageId } }) : await deleteAssistantMutation.mutateAsync({ data: { messageId: messageId } })}>
                        <TrashIcon />
                    </Button>

                    {messageType === 'assistant' ?
                        (
                            <>
                                <Button variant='ghost' size={'icon'}>
                                    <HeartIcon />
                                </Button>
                                <Button variant='ghost' size={'icon'}>
                                    <MagicWandIcon />
                                </Button>
                            </>
                        ) : ''
                    }
                </Flex>
            </div>
        </div>
    );
}