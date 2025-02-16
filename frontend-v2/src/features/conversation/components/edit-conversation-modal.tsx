import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateConversationMutation } from "../api/update-conversation";
import { useConversationalTitleGenerator } from "@/features/conversation/hooks/generate-conversation-title";
import { BarLoader } from "react-spinners";
import { Pencil, WandSparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  conversationId: string;
  currentTitle: string;
  onClose?: () => void;
}

export function EditConversationModal({
  conversationId,
  currentTitle,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const { mutateAsync: updateConversation, isLoading: isUpdating } =
    updateConversationMutation();
  const { generateConversationTitle, isLoading: isGenerating } =
    useConversationalTitleGenerator(conversationId);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleUpdate = async () => {
    if (title == currentTitle) {
      setOpen(false)
      onClose?.();
      return;
    }
    try {
      await updateConversation({
        data: {
          conversationId,
          updates: { title },
        },
      });
      toast.success("Conversation updated successfully");
      setOpen(false);
      onClose?.();
    } catch (error) {
      toast.error("Failed to update conversation");
      console.error(error);
    }
  };

  const handleGenerateTitle = async () => {
    try {
      const generatedTitle = await generateConversationTitle();
      setTitle(generatedTitle);
    } catch (error) {
      toast.error("Failed to generate title");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="p-2 w-full flex justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Pencil size={15} className="mr-2" />
          <span className="w-full text-left">Edit Conversation</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Conversation Title</DialogTitle>
          <DialogDescription>
            Update the title manually or generate one with AI.
          </DialogDescription>
        </DialogHeader>

        <Card className="w-full flex justify-between items-center p-2">
          {isGenerating ? (
            <div className="h-12 flex items-center w-full">
              <BarLoader height={4} width="100%" color="hsl(var(--primary))" />
            </div>
          ) : (
            <Textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
              className="outline-none border-none w-full py-3 px-1 resize-none no-scrollbar focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 shadow-none min-h-12 h-12"
            />
          )}
        </Card>

        <DialogFooter>
          <div className="flex w-full justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleGenerateTitle}
              className="p-3"
              disabled={isGenerating}
            >
              <WandSparkles size={15} />
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isGenerating}
              size="sm"
            >
              Update
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
