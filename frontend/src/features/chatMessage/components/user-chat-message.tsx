import { Flex, Card, Text } from "@radix-ui/themes";
import { deleteUserMessageMutation } from "@/features/chatMessage/api/delete-user-message";
import { DeleteMessageModal } from "./delete-message-modal";
import { UserMessage } from "@/types/api";
import { ImageExpandModal } from "./image-expander-modal";
import MarkdownRenderer from "@/features/markdown/components/markdown";

export function UserChatMessage({
  userMessageData,
}: {
  userMessageData: UserMessage;
}) {
  const deleteMutation = deleteUserMessageMutation({
    conversationId: userMessageData.conversation,
  });

  return (
    <div className="mb-2">
      <div className="flex justify-end">
        <Card className="w-fit flex flex-col">
          {userMessageData.image
            ? ImageExpandModal({ imagePath: userMessageData.image })
            : null}
          <div>
            <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
              <Text size="2">
                <MarkdownRenderer markdown={userMessageData.content} />
              </Text>
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-end">
        <Flex gap="0" align="center">
          <DeleteMessageModal
            messageId={userMessageData.id}
            deleteMutation={deleteMutation}
          />
        </Flex>
      </div>
    </div>
  );
}
