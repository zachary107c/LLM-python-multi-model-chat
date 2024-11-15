import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { UserProfile } from "@/types/api";

export const useGetProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      return api.get(`/user/`, {
        headers: {
          Authorization: `Token ${Cookies.get("token")}`,
        },
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};
