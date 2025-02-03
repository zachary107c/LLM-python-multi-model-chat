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

interface UpdateConversationModalProps {
  conversationId: string;
  currentTitle: string;
}

export function UpdateConversationModal({
  conversationId,
  currentTitle,
}: UpdateConversationModalProps) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const updateMutation = updateConversationMutation();
  const { generateConversationTitle, isLoading } =
    useConversationalTitleGenerator(conversationId);

  useEffect(() => {
    setNewTitle(currentTitle);
  }, [currentTitle]);

  const handleUpdate = async (title: string) => {
    try {
      await updateMutation.mutateAsync({
        data: { conversationId: conversationId, updates: { title: title } },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleGenerateAiTitle = async () => {
    setNewTitle(await generateConversationTitle());
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-2 w-full flex justify-start">
            <Pencil size={15} className="mr-2" />
            <div className="w-full text-left">Edit Conversation</div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Conversation Title</DialogTitle>
            <DialogDescription>
              Update the title to your conversation manually or by using the
              MagicTitle™.
            </DialogDescription>
          </DialogHeader>
          <Card className="w-full flex justify-between items-center">
            {isLoading ? (
              <div className="h-[48px] flex items-center">
                <BarLoader height={4} width={"100%"} color="#484848" />
              </div>
            ) : (
              <Textarea
                className="mr-2 outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar"
                onChange={(event: any) => setNewTitle(event.target.value)}
                value={newTitle}
                placeholder="Type your message here"
              />
            )}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                onClick={async () => handleGenerateAiTitle()}
                className="p-3"
              >
                <WandSparkles size={15} />
              </Button>
            </div>
          </Card>
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => handleUpdate(newTitle)}
              size="sm"
            >
              Update Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
