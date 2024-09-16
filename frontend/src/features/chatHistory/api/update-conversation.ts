import { z } from 'zod';
import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const updateConversationInputSchema = z.object({
    title: z.string(),
});

export type UpdateConversationInput = z.infer<typeof updateConversationInputSchema>;

export const updateConversation = async ({ conversationId, data }: { conversationId: string, data: UpdateConversationInput }): Promise<Conversation> => {
    return await api.put(`/conversations/${conversationId}/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
