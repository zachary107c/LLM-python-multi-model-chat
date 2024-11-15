import { z } from "zod";
import { api } from "@/lib/api-client";
import { AssistantMessage } from "@/types/api";
import Cookies from "js-cookie";

export const createAssistantMessageInputSchema = z.object({
  conversation: z.string(),
  content_variations: z.array(z.string()),
  generated_by: z.string(),
  model: z.number(),
  provider: z.string(),
});

export type CreateAssistantMessageInput = z.infer<
  typeof createAssistantMessageInputSchema
>;

export const createAssistantMessage = ({
  data,
}: {
  data: CreateAssistantMessageInput;
}): Promise<AssistantMessage> => {
  return api.post(`/messages/assistant/`, data, {
    headers: { Authorization: `Token ${Cookies.get("token")}` },
  });
};
