import Panel from "@/components/ui/panel"
import { TrashIcon, HeartIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { deleteAssistantMessage } from "../api/delete-assistant-message";
import { deleteUserMessage } from "../api/delete-user-message";
import { Flex } from "@radix-ui/themes";


export function ChatMessage({ messageText, messageType, messageId }: any) {

    async function handleDelete(id: string) {
        if (messageType === 'user') {
            await deleteUserMessage({ messageId: id });
        } else {
            await deleteAssistantMessage({ messageId: id });
        }
        window.document.location.reload();
    }



    return (
        <div className="mb-2">
            <div>
                <Panel title={messageType === 'user' ? 'You' : 'LLM'} text={messageText} role={messageType} />
            </div>
            { messageType === 'assistant' ? <div className={messageType === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <Flex gap="0" align="center">
                    <Button variant='ghost' size={'icon'} onClick={() => handleDelete(messageId)}>
                        <TrashIcon />
                    </Button>
                    <Button variant='ghost' size={'icon'}>
                        <HeartIcon />
                    </Button>
                    <Button variant='ghost' size={'icon'}>
                        <MagicWandIcon />
                    </Button>
                </Flex>
            </div> : ''}
        </div>
    );
}