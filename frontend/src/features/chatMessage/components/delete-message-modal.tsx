import { AlertDialog, Flex, Button } from "@radix-ui/themes";
import { Button as LocalButton } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";

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
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <LocalButton variant={"ghost-no-hover"} className="mx-1 px-1 py-0 my-0">
          <TrashIcon />
        </LocalButton>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="1">
        <AlertDialog.Title size="2">Delete Message</AlertDialog.Title>
        <AlertDialog.Description size="1">
          Are you sure? This message will no longer be accessible.
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="between">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray" size="1">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="solid" color="red" onClick={handleDelete} size="1">
              Delete Message
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
