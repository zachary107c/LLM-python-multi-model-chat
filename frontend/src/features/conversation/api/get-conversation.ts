import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { ConversationDetail } from "@/types/api";

export const getConversationInputSchema = z.object({
  conversationId: z.string(),
});

export type GetConversationInput = z.infer<typeof getConversationInputSchema>;

export const useGetConversationQuery = ({
  conversationId,
}: GetConversationInput) => {
  return useQuery<ConversationDetail, Error>({
    queryKey: ["conversation", conversationId],
    queryFn: async (): Promise<ConversationDetail> => {
      return api.get(`/conversations/${conversationId}/`, {
        headers: {
          Authorization: `Token ${Cookies.get("token")}`,
        },
      });
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5
  });
};