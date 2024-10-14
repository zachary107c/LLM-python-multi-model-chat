import { api } from '@/lib/api-client';
import { Suggestions } from '@/types/api';
import Cookies from 'js-cookie';
import { useQuery } from "@tanstack/react-query";

export const useGetSuggestionsQuery = () => {
    return useQuery({
        queryFn: async (): Promise<Suggestions | null> => {
            return api.get('/ollama/suggestions/', {
                headers: {
                    Authorization: `Token ${Cookies.get('token')}`,
                },
            });
        },
        queryKey: ["suggestions"],
        staleTime: 1000 * 60,
    });
}
