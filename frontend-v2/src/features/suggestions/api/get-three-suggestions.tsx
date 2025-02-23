import { api } from "@/lib/api-client";
import { Suggestions } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export const useGetSuggestionsQuery = (count: number) => {
  return useQuery({
    queryKey: ["suggestions", count],
    queryFn: async (): Promise<Suggestions | null> => {
      return api.post("/suggestions/", {
        provider: "ollama",
        model: "llama3.2:latest",
        count: count,
      });
    },
    staleTime: 1000 * 60 * 100,
  });
};
