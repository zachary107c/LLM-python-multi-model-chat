import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { Tool } from "@/types/api";

export const createToolMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<Tool>({
        mutationFn: async (): Promise<Tool> => {
            const response = await api.post(`/tools/`, {}, {
                headers: { Authorization: `Token ${Cookies.get("token")}` },
            });
            return response.data as Tool;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tools"] });
        },
    });
};