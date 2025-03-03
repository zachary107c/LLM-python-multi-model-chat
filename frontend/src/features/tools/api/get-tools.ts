import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Tool } from "@/types/api";

export const useGetToolsQuery = () => {
  return useQuery({
    queryFn: (): Promise<Tool[]> => {
      return api.get('/tools/');
    },
    queryKey: ["tools"],
    staleTime: 1000 * 60 * 10,
  });
};
