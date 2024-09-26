import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { UserProfile } from '@/types/api';
import Cookies from 'js-cookie';

export const updateProfileInputSchema = z.object({
    conversationId: z.string(),
    updates: z.object({
        username: z.string().optional(),
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        profile: z.object({
            image: z.string().optional(),
            bio: z.string().optional(),
            preferredModel: z.number().optional()
        })
    })
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;


export const updateProfileMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ data }: { data: UpdateProfileInput }): Promise<UserProfile> => {
            return api.put('/user/', data,
                { headers: { Authorization: `Token ${Cookies.get('token')}` } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
    });
}