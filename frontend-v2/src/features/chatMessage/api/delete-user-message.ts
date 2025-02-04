import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";

export const deleteUserMessageInputSchema = z.object({
  messageId: z.string(),
});

export type DeleteUserMessageInput = z.infer<
  typeof deleteUserMessageInputSchema
>;

export const deleteUserMessageMutation = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: DeleteUserMessageInput;
    }): Promise<void> => {
      return await api.delete(`/messages/user/${data.messageId}/`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });
};
