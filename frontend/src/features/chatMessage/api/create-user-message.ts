import { z } from 'zod';
import { api } from '@/lib/api-client';
import { UserMessage } from '@/types/api';
import Cookies from 'js-cookie';

export const createUserMessageInputSchema = z.object({
  conversation: z.number(),
  content: z.string(),
});

export type CreateUserMessageInput = z.infer<typeof createUserMessageInputSchema>;

export const createUserMessage = ({ data }: { data: CreateUserMessageInput }): Promise<UserMessage> => {
  return api.post(`/messages/user/`, data, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
