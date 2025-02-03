import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { User } from "@/types/api";

export const useGetUserSettingsQuery = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async (): Promise<User> => {
            return api.get('/user/');
        },
        staleTime: 1000 * 60 * 5,
    });
};