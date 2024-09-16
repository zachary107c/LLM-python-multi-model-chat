import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';

export const deleteConversation = ({
    conversationId,
}: {
    conversationId: string;
})  => {
    return api.delete(`/conversations/${conversationId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
