import { api } from '@/lib/api-client';
import { ConversationDetail } from '@/types/api';
import Cookies from 'js-cookie';

export const getConversation = ({
    conversationId,
}: {
    conversationId: string;
}): Promise<ConversationDetail> => {
    return api.get(`/conversations/${conversationId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
