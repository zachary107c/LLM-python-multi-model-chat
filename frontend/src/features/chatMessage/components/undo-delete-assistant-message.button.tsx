import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";
import { undoDeleteAssistantMessageMutation } from "../api/undo-delete-message";
import { Tooltip } from "@radix-ui/themes";

export function UndoDeleteAssistantMessageButton({
  messageId,
  conversationId,
}: {
  messageId: string;
  conversationId: string;
}) {
  const undoMutation = undoDeleteAssistantMessageMutation({
    conversationId: conversationId,
  });

  async function handleUndoDeleteAssistantMessage() {
    try {
      const response = await undoMutation.mutateAsync({
        data: { messageId: messageId },
      });
    } catch (error) {
      console.error("Failed to undo the delete", error);
    }
  }

  return (
    <Tooltip content="Undo Delete">
      <Button
        variant={"ghost-no-hover"}
        className="mx-1 px-1 py-0 my-0"
        size={"icon"}
        onClick={handleUndoDeleteAssistantMessage}
        aria-label="Redo"
      >
        <ResetIcon />
      </Button>
    </Tooltip>
  );
}
