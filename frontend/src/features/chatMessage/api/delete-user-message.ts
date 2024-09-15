import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';

export const deleteUserMessage = ({
    messageId,
}: {
    messageId: string;
}) => {
    return api.delete(`/messages/user/${messageId}/`, { headers: { Authorization: `Token ${Cookies.get('token')}` } });
};
