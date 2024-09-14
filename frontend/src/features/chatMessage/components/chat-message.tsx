import Panel from "@/components/ui/panel"
import { TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import axios from "axios";


export function ChatMessage({ messageText, messageType, messageId, token,  }: any) {

    async function handleDelete(id) {
        const response = await axios.delete(`http://127.0.0.1:8000/api/v1/messages/${messageType}/${id}/`, {headers: {Authorization: `Token ${token}`}})
        window.document.location.reload();
    }



    return (
        <>
            <div>
                <Panel title={messageType === 'user' ? 'You' : 'LLM'} text={messageText} role={messageType} />
            </div>
            <div className={messageType === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <Button variant='ghost' size={'icon'} onClick={() => handleDelete(messageId)}>
                    <TrashIcon />
                </Button>
            </div>
        </>
    );
}