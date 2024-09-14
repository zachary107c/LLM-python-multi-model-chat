import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { set } from "js-cookie";


export function ChatHistory({token, onSelectedIdChange}: any) {

    const [selected, setSelected] = useState(-1);
    const [selectedId, setSelectedId] = useState(null);
    const [chats, setHistory] = useState([]);

    function handleSetSelected(index: number) {
        setSelected(index);
        setSelectedId(chats[index]?.id);
        onSelectedIdChange(chats[index]?.id);
    }

    useEffect(() => {
        const fetchChatHistory = async () => {
            const response = await axios.get('http://127.0.0.1:8000/api/v1/conversations/', {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            const data = await response.data;
            setHistory(data);
            setSelectedId(data[0].id);
        };

        if (token) {
            fetchChatHistory();
        }
    }, [token]);


    return (
        <div className="mx-4">
            <div className="flex flex-col justify-center align-top mt-2">
                <div className="flex flex-col w-full">
                    {chats.map((chat, index) => (
                        <div className="w-full flex justify-start overflow-hidden">
                            {
                                index === selected ?
                                    <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(index)}>
                                        {chat.title}
                                    </Button>
                                    :
                                    <Button size='sm' variant={'ghost'} className="mb-1 w-full justify-between " onClick={() => handleSetSelected(index)}>
                                        {chat.title}
                                    </Button>
                            }
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    )
}