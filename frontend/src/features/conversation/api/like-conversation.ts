import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';
import { ConversationDetail } from "@/types/api";

export const likeConversationInputSchema = z.object({
    liked: z.boolean(),
});

export type LikeConversationInput = z.infer<typeof likeConversationInputSchema>;

export const likeConversationMutation = ({ conversationId }: { conversationId: string | null }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: LikeConversationInput }): Promise<ConversationDetail> => {
            return api.patch(`/conversations/${conversationId}/`, { liked: data.liked }, {
                headers: { Authorization: `Token ${Cookies.get('token')}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
};