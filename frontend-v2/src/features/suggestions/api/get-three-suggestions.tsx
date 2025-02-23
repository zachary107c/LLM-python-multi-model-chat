import { api } from "@/lib/api-client";
import { Suggestions } from "@/types/api";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";

export const useGetSuggestionsQuery = (count: number) => {
  return useQuery({
    // Adding count to the queryKey ensures that the cache correctly differentiates between queries with different counts
    queryKey: ["suggestions", count],
    queryFn: async (): Promise<Suggestions | null> => {
      return api.post(
        "/suggestions/",
        { provider: "ollama", model: "phi4:latest", count: count },
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        },
      );
    },
    staleTime: 1000 * 60 * 100,
  });
};