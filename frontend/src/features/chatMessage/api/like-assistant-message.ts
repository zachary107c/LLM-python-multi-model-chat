import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { AssistantMessage } from "@/types/api";

export const likeAssistantMessageInputSchema = z.object({
  liked: z.boolean(),
  messageId: z.string(),
});

export type LikeAssistantMessageInput = z.infer<
  typeof likeAssistantMessageInputSchema
>;

export const likeAssistantMessageMutation = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: LikeAssistantMessageInput;
    }): Promise<AssistantMessage> => {
      return api.put(
        `/messages/assistant/${data.messageId}/`,
        { liked: data.liked },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        },
      );
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ["conversation", conversationId],
      // });
    },
  });
};
