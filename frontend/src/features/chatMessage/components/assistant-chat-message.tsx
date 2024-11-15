import { Flex, Card, Text } from "@radix-ui/themes";
import { DividerVerticalIcon, SlashIcon } from "@radix-ui/react-icons";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";

export function AssistantChatMessage({
  assistantMessageData,
}: {
  assistantMessageData: AssistantMessage;
}) {
  const deleteMutation = deleteAssistantMessageMutation({
    conversationId: assistantMessageData.conversation,
  });

  return (
    <div className="mb-2">
      <div>
        <div>
          <div className="mb-1 flex justify-start items-center">
            <div className="flex items-center">
              <Text
                color={assistantMessageData.model.color}
                className="ml-1"
                size='1'
              >
                {assistantMessageData.model.name}
              </Text>
              <Text>
                <SlashIcon />
              </Text>
              <Text weight="light" size="1">
                {new Date(assistantMessageData.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  },
                )}
              </Text>
            </div>
          </div>
          <div className="flex justify-start">
            <Card className="w-fit flex flex-col">
              <div>
                <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
                  <Text size="2">
                    <MarkdownRenderer markdown={assistantMessageData.content} />
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        <Flex gap="0" align="center">
          <DeleteMessageModal
            messageId={assistantMessageData.id}
            deleteMutation={deleteMutation}
          />
          <LikeMessageButton
            messageId={assistantMessageData.id}
            isLiked={assistantMessageData.liked}
            conversationId={assistantMessageData.conversation}
          />
        </Flex>
      </div>
    </div>
  );
}
