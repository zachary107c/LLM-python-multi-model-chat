import { Flex, Card, Text, Badge } from "@radix-ui/themes";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";



export function AssistantChatMessage({ assistantMessageData }: { assistantMessageData: AssistantMessage }) {
    const deleteMutation = deleteAssistantMessageMutation({ conversationId: assistantMessageData.conversation });

    return (
        <div className="mb-2">
            <div>
                <div>
                    <div className='mb-1 flex justify-start items-center'>
                        <div className="flex items-center">
                            <Badge variant='surface' color={assistantMessageData.model.color} className="mr-1" radius="large">
                                {assistantMessageData.model.name}
                            </Badge>
                        </div>
                    </div>
                    <div className='flex justify-start'>
                        <Card className="w-fit flex flex-col">
                            <div>
                                <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
                                    <Text size='2'>
                                        <MarkdownRenderer markdown={assistantMessageData.content} />
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <div className='flex justify-start'>
                <Flex gap="0" align="center">
                    <DeleteMessageModal messageId={assistantMessageData.id} deleteMutation={deleteMutation} />
                    <LikeMessageButton messageId={assistantMessageData.id} isLiked={assistantMessageData.liked} conversationId={assistantMessageData.conversation} />
                </Flex>
            </div>
        </div>
    );
}