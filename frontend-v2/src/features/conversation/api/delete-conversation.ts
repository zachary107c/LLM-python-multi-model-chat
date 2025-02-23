import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";

export const deleteConversationInputSchema = z.object({
  conversationId: z.string(),
});

export type DeleteConversationInput = z.infer<
  typeof deleteConversationInputSchema
>;

export const deleteConversationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: DeleteConversationInput;
    }): Promise<void> => {
      return await api.delete(`/conversations/${data.conversationId}/`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
