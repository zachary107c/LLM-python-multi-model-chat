import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { Conversation } from "@/types/api";
import Cookies from "js-cookie";

export const updateConversationInputSchema = z.object({
  conversationId: z.string(),
  updates: z.object({
    title: z.string(),
  }),
});

export type UpdateConversationInput = z.infer<
  typeof updateConversationInputSchema
>;

export const updateConversationMutation = () => {
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: UpdateConversationInput;
    }): Promise<Conversation> => {
      if (data.updates.title.length > 255) {
        data.updates.title = data.updates.title.substring(0, 255);
      }
      return api.put(`/conversations/${data.conversationId}/`, data.updates, {
        headers: { Authorization: `Token ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
