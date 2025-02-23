import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteToolMutation } from "../api/delete-tool";
import { Trash2 } from "lucide-react";

interface DeleteConversationModalProps {
  toolId: string;
}

export function DeleteToolModal({
  toolId,
}: DeleteConversationModalProps) {
  const deleteMutation = deleteToolMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        data: { toolId: toolId },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive" className="flex-1 mx-2">
          <Trash2 size={15} />
          Delete Tool
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Tool</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure? This tool will no longer be accessible.
        </AlertDialogDescription>
        <div className="flex justify-between gap-3 mt-4">
          <AlertDialogCancel asChild>
            <Button variant="secondary">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90" onClick={handleDelete}>
              Delete Tool
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
