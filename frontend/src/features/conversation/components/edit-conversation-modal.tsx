import { useEffect, useState } from "react";
import { Dialog, Flex, Button, Card } from "@radix-ui/themes";
import { Textarea } from "@/components/ui/textarea";
import { Button as LocalButton } from "@/components/ui/button";
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
    <Dialog.Root>
      <Dialog.Trigger>
        <LocalButton variant="ghost" className="p-2 w-full flex justify-start">
          <Pencil size={15} className="mr-2" />
          <div className="w-full text-left">Edit Conversation</div>
        </LocalButton>
      </Dialog.Trigger>
      <Dialog.Content size="1">
        <Dialog.Title size="2">Edit Conversation Title</Dialog.Title>
        <Card
          className="w-full flex justify-between items-center"
          style={
            {
              "--base-card-padding-top": "var(--space-1)",
              "--base-card-padding-bottom": "var(--space-1)",
              "--base-card-padding-left": "var(--space-2)",
              "--base-card-padding-right": "var(--space-2)",
            } as any
          }
          size="1"
          variant="surface"
        >
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
            <LocalButton
              variant="ghost"
              onClick={async () => handleGenerateAiTitle()}
              className="p-3"
            >
              <WandSparkles size={15} />
            </LocalButton>
          </div>
        </Card>
        <Flex gap="3" mt="4" justify="between">
          <Dialog.Close>
            <Button variant="soft" color="gray" size="1">
              Close
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button
              variant="solid"
              color="green"
              onClick={() => handleUpdate(newTitle)}
              size="1"
            >
              Update Conversation
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
