import { api } from '@/lib/api-client';
import { Conversation } from '@/types/api';
import Cookies from 'js-cookie';

export const getConversations = async (): Promise<Conversation[]> => {
    return await api.get(`/conversations/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
