import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';

export const deleteAssistantMessageInputSchema = z.object({
    messageId: z.string(),
});

export type DeleteAssistantMessageInput = z.infer<typeof deleteAssistantMessageInputSchema>;

export const deleteAssistantMessageMutation = ({ conversationId }: { conversationId: string }) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: DeleteAssistantMessageInput }): Promise<void> => {
            return api.delete(`/messages/assistant/${data.messageId}/`, {
                headers: { Authorization: `Token ${Cookies.get('token')}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
        },
    });
};