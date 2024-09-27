import Panel from "@/components/ui/panel"
import { Button } from "@/components/ui/button";
import { Flex } from "@radix-ui/themes";
import { TrashIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { deleteUserMessageMutation } from "@/features/chatMessage/api/delete-user-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";



export function ChatMessage({ messageText, messageType, messageId, name, liked, conversationId }: { messageText: string, messageType: string, messageId: string, name: string, liked: boolean | undefined, conversationId: string }) {
    const deleteUserMutation = deleteUserMessageMutation({ conversationId: conversationId });
    const deleteAssistantMutation = deleteAssistantMessageMutation({ conversationId: conversationId });

    return (
        <div className="mb-2">
            <div>
                <Panel title={messageType === 'user' ? 'You' : 'LLM'} text={messageText} role={messageType} name={name}/>
            </div>
            <div className={messageType === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <Flex gap="0" align="center">
                    <DeleteMessageModal messageId={messageId} deleteMutation={ messageType === 'user' ? deleteUserMutation : deleteAssistantMutation} />
                    {messageType === 'assistant' ?
                        (
                            <>
                                <LikeMessageButton messageId={messageId} isLiked={liked} conversationId={conversationId}/>
                            </>
                        ) : ''
                    }
                </Flex>
            </div>
        </div>
    );
}