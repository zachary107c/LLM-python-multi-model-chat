import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import Cookies from "js-cookie";
import { UserSettings } from "@/types/api";

export const useUpdateUserSettingsMutation = () => {
  const queryClient = useQueryClient();
  const token = Cookies.get("token");

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: FormData;
    }): Promise<UserSettings> => {
      console.log(data);
      return api.patch(`/user/`, data, {
        headers: { 
          Authorization: `Token ${token}`,
        },
        transformRequest: (data) => data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};