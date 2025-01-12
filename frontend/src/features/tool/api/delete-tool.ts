import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/toast/toast-provider";

export const deleteToolInputSchema = z.object({
    toolId: z.string(),
});

export type DeleteToolInput = z.infer<
    typeof deleteToolInputSchema
>;

export const deleteToolMutation = () => {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            data,
        }: {
            data: DeleteToolInput;
        }): Promise<void> => {
            return await api.delete(`/tools/${data.toolId}/`, {
                headers: { Authorization: `Token ${Cookies.get("token")}` },
            });
        },
        onSuccess: () => {
            addToast("Successfully deleted the tool!", "success");
            queryClient.invalidateQueries({ queryKey: ["tools"] });
        },
    });
};
