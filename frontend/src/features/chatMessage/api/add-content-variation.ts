import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { AssistantMessage } from "@/types/api";

export const addContentVariationInputSchema = z.object({
  new_content_variation: z.string(),
});

export type AddContentVariationInput = z.infer<typeof addContentVariationInputSchema>;

export const useAddContentVariationMutation = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assistantMessageId,
      data,
    }: {
      assistantMessageId: string;
      data: AddContentVariationInput;
    }): Promise<AssistantMessage> => {
      try {
        return api.patch(`/messages/assistant/${assistantMessageId}/`, data, {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        });
      } catch (error) {
        console.error("Oopsie woopsie, something went wrong! UwU", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
    },
  });
};