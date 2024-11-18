import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { UserSettings } from "@/types/api";

export const useGetUserSettingsQuery = () => {
  const token = Cookies.get("token");

  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<UserSettings> => {
      if (!token) {
        throw new Error("User not authenticated");
      }
      return api.get(`/user/`, { headers: { Authorization: `Token ${token}` } });
    },
    enabled: !!token, // Ensures query only runs if a token is present
    staleTime: 1000 * 60 * 5,
  });
};