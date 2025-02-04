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
      <AlertDialogTrigger>
        <Button variant="ghost" className="mx-1 px-1 py-0 my-0">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Message</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure? This message will no longer be accessible.
        </AlertDialogDescription>

        <div className="flex gap-3 mt-4 justify-between">
        <AlertDialogCancel>
            <Button variant="default">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Button variant="default" className="bg-red-500" onClick={handleDelete}>
              Delete Message
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
