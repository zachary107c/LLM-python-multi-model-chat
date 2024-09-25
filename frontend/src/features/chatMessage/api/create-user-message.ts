import { z } from 'zod';
import { api } from '@/lib/api-client';
import { UserMessage } from '@/types/api';
import Cookies from 'js-cookie';

export const createUserMessageInputSchema = z.object({
  conversation: z.string(),
  content: z.string(),
});

export type CreateUserMessageInput = z.infer<typeof createUserMessageInputSchema>;

export const createUserMessage = async ({ data }: { data: CreateUserMessageInput }): Promise<UserMessage> => {
  const response = await api.post(`/messages/user/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
  return response.data;
};
