import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { Conversation } from "@/types/api";

export const updateConversationInputSchema = z.object({
  conversationId: z.string(),
  updates: z.object({
    title: z.string(),
  }),
});

export type UpdateConversationInput = z.infer<typeof updateConversationInputSchema>;

export const updateConversationMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    Conversation, // TData - what the mutation returns
    Error, // TError - error type
    { data: UpdateConversationInput }, // TVariables - input type
    unknown // TContext - rollback context type
  >({
    mutationFn: async ({ data }) => {
      if (data.updates.title.length > 255) {
        data.updates.title = data.updates.title.substring(0, 255);
      }
      return api.put(`/conversations/${data.conversationId}/`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    ...mutation,
    isLoading: mutation.isPending // isPending is the new way to check loading state in v5
  };
};