import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { BaseModelEntity } from "@/types/api";
import Cookies from "js-cookie";

export const useGetModelsQuery = () => {
  return useQuery({
    queryFn: async (): Promise<BaseModelEntity[]> => {
      return api.get(`/ollama/models/`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    queryKey: ["models"],
    staleTime: 1000 * 60 * 0.25,
  });
};
