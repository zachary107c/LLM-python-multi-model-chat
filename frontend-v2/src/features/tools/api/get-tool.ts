import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { Tool } from "@/types/api";

export const getToolInputSchema = z.object({
  toolId: z.string().nullable(),
});

export type GetToolInput = z.infer<typeof getToolInputSchema>;

export const useGetToolQuery = ({ toolId }: GetToolInput) => {
  return useQuery({
    queryKey: ["tool", toolId],
    queryFn: async (): Promise<Tool> => {
      return api.get(`/tools/${toolId}/`, {
        headers: {
          Authorization: `Token ${Cookies.get("token")}`,
        },
      });
    },
    enabled: !!toolId,
    staleTime: 1000 * 60 * 5,
  });
};
