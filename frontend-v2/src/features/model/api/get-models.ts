import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { BaseModelEntity } from "@/types/api";

export const useGetModelsQuery = () => {
  return useQuery({
    queryFn: async (): Promise<BaseModelEntity[]> => {
      return api.get(`/models/`);
    },
    queryKey: ["models"],
    staleTime: 1000 * 60 * 0.25,
  });
};
