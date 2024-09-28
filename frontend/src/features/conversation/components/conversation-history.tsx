import { useEffect, useState } from "react";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tooltip, Text } from "@radix-ui/themes";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetConversationsQuery } from "@/features/conversation/api/get-conversations";
import { Conversation } from "@/types/api";
import { ConversationList } from "./conversation-list";
import { ConversationListLoading } from "./conversation-list-loading";


export function ConversationHistory({ onSelectedIdChange }: any) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [expanded, setExpanded] = useState(true);
    const currentConversationId = searchParams.get('c');
    const { data: chats, isLoading } = useGetConversationsQuery();
    const createMutation = createConversationMutation();
    const [bookmarkedChats, setBookmarkChats] = useState<Conversation[]>([]);
    const [nonBookmarkedChats, setNonBookmarkChats] = useState<Conversation[]>([]);

    function handleSetExpanded(e: any) {
        setExpanded(e);
    };

    function handleSetSelected(conversationId: string) {
        if (chats !== null && chats !== undefined) {
            onSelectedIdChange(conversationId);
            setSearchParams({ c: conversationId });
        }
    }

    async function handleNewConversation() {
        try {
            var response = await createMutation.mutateAsync({ data: { previousConversationId: currentConversationId || undefined, data: { title: "New Conversation" } } });
            setSearchParams({ c: response.id });
            handleSetSelected(response.id);
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        if (chats) {
            setBookmarkChats(chats.filter((chat) => chat.liked));
            setNonBookmarkChats(chats.filter((chat) => !chat.liked));
        }
    }, [chats]);

    return (
        <div className={`${expanded ? 'w-[250px] max-w-[250px] h-full' : 'h-full'}`}>
            {!expanded &&
                <div className="overflow-y-scroll no-scrollbar border-r border-[#7d7d7d68] h-full">
                    <div className="mx-2 mt-2">
                        <Button variant={'ghost'} className="p-2">
                            <PinRightIcon onClick={() => handleSetExpanded(true)} />
                        </Button>
                    </div>
                </div>
            }
            <div className={`${expanded ? 'overflow-y-scroll no-scrollbar' : 'hidden'
                } border-r border-[#7d7d7d68] w-full h-full`}>
                <div className="flex justify-between items-center mx-2 mt-2">
                    <Button variant='ghost' className="p-2">
                        <PinLeftIcon onClick={() => handleSetExpanded(false)} />
                    </Button>
                    <Tooltip content="New Conversation" side="right">
                        <Button variant='ghost' className="ml-2 p-2" onClick={async () => handleNewConversation()}>
                            <PlusIcon />
                        </Button>
                    </Tooltip>
                </div>
                <div className="mx-2">
                    <div className="flex flex-col justify-center align-top">
                        <div className="flex flex-col w-full">
                            <div>
                                <Text weight='bold'>Bookmarked Chats</Text>
                                {isLoading ? <ConversationListLoading /> : <ConversationList chats={bookmarkedChats} currentConversationId={currentConversationId} handleSetSelected={handleSetSelected} />}
                            </div>
                            <div>
                                <Text weight='bold'>Other Chats</Text>
                                {isLoading ? <ConversationListLoading /> : <ConversationList chats={nonBookmarkedChats} currentConversationId={currentConversationId} handleSetSelected={handleSetSelected} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}