import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { UserMessage } from "@/types/api";

export const undoDeleteUserMessageInputSchema = z.object({
  messageId: z.string(),
});

export type UndoDeleteUserMessageInput = z.infer<
  typeof undoDeleteUserMessageInputSchema
>;

export const undoDeleteUserMessageMutation = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: UndoDeleteUserMessageInput;
    }): Promise<UserMessage> => {
      return api.patch(
        `/messages/user/${data.messageId}/`,
        { is_deleted: false },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });
};
