import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const getConversations = (): Promise<Conversation[]> => {
    return api.get(`/conversations/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
