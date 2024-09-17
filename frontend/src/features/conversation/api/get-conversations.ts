import { useQuery } from "@tanstack/react-query";
import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const useGetConversationQuery = () => {
    return useQuery({
        queryFn: (): Promise<Conversation[]> => {
            return api.get(`/conversations/`, {
                headers: { Authorization: `Token ${Cookies.get('token')}` }
            });
        },
        queryKey: ["conversations"],
        staleTime: 1000 * 60 * 0.25,
    });
}