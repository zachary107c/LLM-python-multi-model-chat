import { Card } from "@/components/ui/card";
import { deleteUserMessageMutation } from "@/features/chatMessage/api/delete-user-message";
import { DeleteMessageModal } from "./delete-message-modal";
import { UserMessage } from "@/types/api";
import { ImageExpandModal } from "./image-expander-modal";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import { UndoDeleteUserMessageButton } from "./undo-delete-user-message-button";

export function UserChatMessage({
  userMessageData,
}: {
  userMessageData: UserMessage;
}) {
  const deleteMutation = deleteUserMessageMutation({
    conversationId: userMessageData.conversation,
  });

  function localizeUTCDates(text: string) {
    const utcDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g;
    return text.replace(utcDatePattern, (match) => {
      const date = new Date(match);
      return date.toLocaleString(navigator.language, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
    });
  }

  return (
    <div className="mb-2">
      <div className="flex flex-col items-end">
        {userMessageData.image
          ? ImageExpandModal({ imagePath: userMessageData.image })
          : null}
        <Card className="w-fit flex flex-col p-2 bg-secondary shadow-none rounded-md">
          <div>
            <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
              <span className="text-sm">
                <MarkdownRenderer
                  content={localizeUTCDates(userMessageData.content)}
                />
              </span>
            </div>
          </div>
        </Card>
      </div>
      {userMessageData.is_deleted ? (
        userMessageData.recoverable ? (
          <div className="flex justify-end">
            <div className="flex gap-0 align-middle">
              <UndoDeleteUserMessageButton
                messageId={userMessageData.id}
                conversationId={userMessageData.conversation}
              />
            </div>
          </div>
        ) : (
          <></>
        )
      ) : (
        <div className="flex justify-end">
          <div className="flex gap-0 align-middle">
            <DeleteMessageModal
              messageId={userMessageData.id}
              deleteMutation={deleteMutation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
