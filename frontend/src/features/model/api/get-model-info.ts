import { useQuery } from "@tanstack/react-query";
import { z } from 'zod';
import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';
import { ModelDetail } from "@/types/api";


export const getModelInputSchema = z.object({
    modelId: z.number(),
});

export type GetModelInput = z.infer<typeof getModelInputSchema>;

export const useGetModelQuery = ({ modelId }: GetModelInput) => {
    return useQuery({
        queryKey: ['model', modelId],
        queryFn: async (): Promise<ModelDetail> => {
            return api.get(`/ollama/models/${modelId}/`, {
                headers: {
                    Authorization: `Token ${Cookies.get('token')}`,
                },
            });
        },
        enabled: !!modelId,
        staleTime: 1000 * 60 * 5
    });
};