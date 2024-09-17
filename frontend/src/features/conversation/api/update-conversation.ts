import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const updateConversationInputSchema = z.object({
    title: z.string(),
});

export type UpdateConversationInput = z.infer<typeof updateConversationInputSchema>;


export const updateConversationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, data }: { conversationId: string, data: UpdateConversationInput }): Promise<Conversation> => {
            return api.put(`/conversations/${conversationId}/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
}