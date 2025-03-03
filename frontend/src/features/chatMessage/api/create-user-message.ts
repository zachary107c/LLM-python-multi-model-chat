import { boolean, z } from "zod";
import { api } from "@/lib/api-client";
import { UserMessage } from "@/types/api";

export const createUserMessageInputSchema = z.object({
  conversation: z.string(),
  content: z.string(),
  image: z.instanceof(File).nullable().optional(),
  use_tools: z.boolean().default(false)
});

export type CreateUserMessageInput = z.infer<typeof createUserMessageInputSchema>;

export const createUserMessage = async ({
  data,
}: {
  data: CreateUserMessageInput;
}): Promise<UserMessage> => {
  const formData = new FormData();
  formData.append("conversation", data.conversation);
  formData.append("content", data.content);
  if (data.image instanceof File) {
    formData.append("image", data.image, data.image.name);
  }
  formData.append("use_tools", data.use_tools.toString());

  console.log('FormData contents:');
  for (const pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  // Verify data before sending
  console.log('Input data:', data);
  return api.post(`/messages/user/`, formData);
};