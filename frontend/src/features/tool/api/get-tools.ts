import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Tool } from "@/types/api";
import Cookies from "js-cookie";

export const useGetToolsQuery = () => {
  return useQuery({
    queryFn: (): Promise<Tool[]> => {
      return api.get(`/tools/`, {
        headers: { Authorization: `Token ${Cookies.get("token")}` },
      });
    },
    queryKey: ["tools"],
    staleTime: 1000 * 60 * 10,
  });
};
