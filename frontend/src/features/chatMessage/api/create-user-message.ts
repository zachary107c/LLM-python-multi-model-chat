import { z } from "zod";
import { api } from "@/lib/api-client";
import { UserMessage } from "@/types/api";
import Cookies from "js-cookie";

export const createUserMessageInputSchema = z.object({
  conversation: z.string(),
  content: z.string(),
  image: z.instanceof(File).nullable().optional(),
});

export type CreateUserMessageInput = z.infer<typeof createUserMessageInputSchema>;

export const createUserMessage = async ({
  data,
}: {
  data: CreateUserMessageInput;
}): Promise<UserMessage> => {
  const formData = new FormData();

  // Append the basic fields
  formData.append("conversation", data.conversation);
  formData.append("content", data.content);

  // Append the file only if it exists
  if (data.image instanceof File) {
    formData.append("image", data.image, data.image.name);
  }

  return api.post(`/messages/user/`, formData, {
    headers: {
      Authorization: `Token ${Cookies.get("token")}`,
    },
  });
};