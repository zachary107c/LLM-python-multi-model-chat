import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { User } from "@/types/api";

export const useUpdateUserSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: FormData;
    }): Promise<User> => {
      console.log(data);
      return api.patch(`/user/`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};