import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import { BaseModelEntity } from "@/types/api";
import Cookies from "js-cookie";

export const updateModelInputSchema = z.object({
  modelId: z.number(),
  updates: z.object({
    color: z.string(),
  }),
});

export type UpdateModelInput = z.infer<typeof updateModelInputSchema>;

type MutationContext = { modelId: number };

export const updateModelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BaseModelEntity,
    unknown,
    { data: UpdateModelInput },
    MutationContext
  >({
    mutationFn: async ({ data }) => {
      return api.put(`/models/${data.modelId}/`, data.updates, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries({ queryKey: ["model", data.modelId] });
      return { modelId: data.modelId };
    },
    onSuccess: (_, __, context) => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: ["model", context.modelId] });
      }
    },
    onError: (_, __, context) => {
      if (context) {
        queryClient.invalidateQueries({ queryKey: ["model", context.modelId] });
      }
    },
  });
};
