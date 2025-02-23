import { useQueryClient, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export const deleteToolInputSchema = z.object({
    toolId: z.string(),
});

export type DeleteToolInput = z.infer<
    typeof deleteToolInputSchema
>;

export const deleteToolMutation = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            data,
        }: {
            data: DeleteToolInput;
        }): Promise<void> => {
            return await api.delete(`/tools/${data.toolId}/`);
        },
        onSuccess: () => {
            toast({title: "Tool Deleted", description: "The tool has been successfully deleted."});
            queryClient.invalidateQueries({ queryKey: ["tools"] });
        },
    });
};
