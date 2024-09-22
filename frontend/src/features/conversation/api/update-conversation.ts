import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const updateConversationInputSchema = z.object({
    conversationId: z.string(),
    updates: z.object({
        title: z.string().optional(),
    })
});

export type UpdateConversationInput = z.infer<typeof updateConversationInputSchema>;


export const updateConversationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: UpdateConversationInput }): Promise<Conversation> => {
            return api.put(`/conversations/${data.conversationId}/`, data.updates,
                { headers: { Authorization: `Token ${Cookies.get('token')}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
    });
}