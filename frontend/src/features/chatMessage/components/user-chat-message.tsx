import { Flex, Card, Text } from "@radix-ui/themes";
import { deleteUserMessageMutation } from "@/features/chatMessage/api/delete-user-message";
import { DeleteMessageModal } from "./delete-message-modal";
import { UserMessage } from "@/types/api";
import { ImageExpandModal } from "./image-expander-modal";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import { UndoDeleteMessageButton } from "./undo-delete-user-message-button";

export function UserChatMessage({
  userMessageData,
}: {
  userMessageData: UserMessage;
}) {
  const deleteMutation = deleteUserMessageMutation({
    conversationId: userMessageData.conversation,
  });

  function localizeUTCDates(text: string) {
    // Regular expression to match ISO 8601 UTC datetime format
    const utcDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g;

    return text.replace(utcDatePattern, (match) => {
      const date = new Date(match);
      return date.toLocaleString(navigator.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        // second: "numeric",
      });
    });
  }

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
                <MarkdownRenderer
                  markdown={localizeUTCDates(userMessageData.content)}
                />
              </Text>
            </div>
          </div>
        </Card>
      </div>
      {userMessageData.is_deleted ? (
        // <div className="flex justify-end">
        //   <Flex gap="0" align="center">
        //     <UndoDeleteMessageButton
        //       messageId={userMessageData.id}
        //       conversationId={userMessageData.conversation}
        //     />
        //   </Flex>
        // </div>
        <></>
      ) : (
        <div className="flex justify-end">
          <Flex gap="0" align="center">
            <DeleteMessageModal
              messageId={userMessageData.id}
              deleteMutation={deleteMutation}
            />
          </Flex>
        </div>
      )}
    </div>
  );
}
