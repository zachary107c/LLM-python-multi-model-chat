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
import { Trash2Icon } from "lucide-react";

interface DeleteMessageModalProps {
  messageId: string;
  deleteMutation: any;
}

export function DeleteMessageModal({
  messageId,
  deleteMutation,
}: DeleteMessageModalProps) {
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ data: { messageId } });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghostNoHover" className="m-0 p-0">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Message</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure? This message will no longer be accessible.
        </AlertDialogDescription>

        <div className="flex gap-3 mt-4 justify-between">
          <AlertDialogCancel asChild>
            <Button variant="secondary" size="sm">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90">
            <Button size="sm" onClick={handleDelete}>
              Delete Message
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
