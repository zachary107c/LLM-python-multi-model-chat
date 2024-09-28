import { useQuery } from "@tanstack/react-query";
import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';
import { UserProfile } from "@/types/api";

export const useGetProfileQuery = () => {
  // Create a sleep function in JavaScript
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

    return useQuery({
        queryKey: ['profile'],
        queryFn: async (): Promise<UserProfile> => {
            await sleep(2000);
            return api.get(`/user/`, {
                headers: {
                    Authorization: `Token ${Cookies.get('token')}`,
                },
            });
        },
        staleTime: 1000 * 60 * 5
    });
};