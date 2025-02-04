import { Button } from "@/components/ui/button";
import { UndoIcon } from "lucide-react";
import { undoDeleteUserMessageMutation } from "../api/undo-delete-message";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UndoDeleteUserMessageButton({
  messageId,
  conversationId,
}: {
  messageId: string;
  conversationId: string;
}) {
  const undoMutation = undoDeleteUserMessageMutation({
    conversationId: conversationId,
  });

  async function handleUndoDeleteUserMessage() {
    try {
      const response = await undoMutation.mutateAsync({
        data: { messageId: messageId },
      });
    } catch (error) {
      console.error("Failed to undo the delete", error);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="mx-1 px-1 py-0 my-0"
          size={"icon"}
          onClick={handleUndoDeleteUserMessage}
          aria-label="Redo"
        >
          <UndoIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Undo Delete</p>
      </TooltipContent>
    </Tooltip>
  );
}
