import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Provider } from "@/types/api";
import Cookies from "js-cookie";

export const useGetProvidersQuery = () => {
  return useQuery({
    queryFn: (): Promise<Provider[]> => {
      return api.get(`/providers/`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    queryKey: ["providers"],
    staleTime: 1000 * 60 * 0.25,
  });
};
