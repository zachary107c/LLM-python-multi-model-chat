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
      return api.patch(`/user/`, data, {
        headers: { 
          Authorization: `Token ${token}`,
          // Don't set Content-Type - axios will automatically set it with the correct boundary
        },
        // Need to disable axios's automatic JSON transformation
        transformRequest: (data) => data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};