import { AlertDialog, Flex, Button, Text } from "@radix-ui/themes";
import { Button as LocalButton } from "@/components/ui/button";
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
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <LocalButton variant="ghost" className="p-2 w-full flex justify-start">
          <Trash2 size={15} className="mr-2" />
          <Text color="red" className="text-left">Delete Tool</Text>
        </LocalButton>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="1">
        <AlertDialog.Title size="2">Delete Tool</AlertDialog.Title>
        <AlertDialog.Description size="1">
          Are you sure? This tool will no longer be accessible.
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="between">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" size="1">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleDelete} size="1">
              Delete Tool
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
