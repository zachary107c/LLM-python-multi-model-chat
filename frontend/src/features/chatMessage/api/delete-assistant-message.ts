import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';

export const deleteAssistantMessage = ({
    messageId,
}: {
    messageId: string;
}) => {
    return api.delete(`/messages/assistant/${messageId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
