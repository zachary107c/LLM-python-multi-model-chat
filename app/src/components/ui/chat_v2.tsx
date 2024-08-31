import { useState } from 'react';
import axios from 'axios';
import { TextArea } from "@radix-ui/themes";
import { Button } from "@radix-ui/themes";
import Panel from './panel';
import { FingerprintSpinner } from 'react-epic-spinners';

const ChatComponent = () => {
    const [textAreaValue, setTextAreaValue] = useState('');
    const [responseData, setResponseData] = useState({ data: '', loading: false });

    const handleSubmit = async (message: string) => {
        setResponseData({ data: '', loading: true })
        if (!message.trim()) return;

        try {
            const res = await axios.post(
                'http://127.0.0.1:11434/api/chat',
                { 'model': 'Jade', 'messages': [{ 'role': 'user', 'content': message }], 'stream': false }
            );
            setResponseData({ data: res.data.message.content, loading: false })
        } catch (error) {
            console.error('Error calling Lollcay API:', error);
            setResponseData({ data: 'erm . . . I ran into an error', loading: false })
        }
    };

    return (
        <div className='flex-col justify-between'>
            <div className='h-full mb-2 w-[50%]'>
                {
                    responseData?.loading ? <FingerprintSpinner color="#8457AA" size={75}/> : <Panel className="W">{responseData.data}</Panel>
                }
            </div>
            <div className="flex justify-between">
                <div className="mr-2 w-full">
                    <TextArea className="w-[100%]" variant="surface" radius="medium" size="1" value={textAreaValue} onChange={(event) => setTextAreaValue(event.target.value)}></TextArea>
                </div>
                <div>
                    <Button onClick={() => handleSubmit(textAreaValue)}>Send</Button>
                </div>
            </div>
        </div>
    )
};

export default ChatComponent;