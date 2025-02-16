import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { deleteConversationMutation } from "../api/delete-conversation";
import { Trash2 } from "lucide-react";

interface DeleteConversationModalProps {
  conversationId: string;
}

export function DeleteConversationModal({
  conversationId,
}: DeleteConversationModalProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const deleteMutation = deleteConversationMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        data: { conversationId: conversationId },
      });
      if (searchParams.get("conversationId") === conversationId) {
        setSearchParams({});
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="p-2 w-full flex justify-start text-destructive">
          <Trash2 size={15} className="mr-2" />
          <span className="text-left">
            Delete Conversation
          </span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure? This conversation will no longer be accessible.
        </AlertDialogDescription>
        <div className="flex gap-3 mt-4 justify-between">
          <AlertDialogCancel asChild>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
              <span>Delete Conversation</span>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
