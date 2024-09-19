import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { likeAssistantMessageMutation } from "../api/like-assistant-message";


export function LikeMessageButton({ messageId, isLiked, conversationId }: { messageId: string, isLiked: boolean | undefined, conversationId: string }) {
    const likeMutation = likeAssistantMessageMutation({ conversationId: conversationId });
    const [liked, setLiked] = useState(isLiked);

    async function handleLikedMessage() {
        const response = await likeMutation.mutateAsync({ data: {messageId: messageId,  liked: !liked}})
        setLiked(response.liked);
    };
    
    return (
        <Button variant='ghost' size={'icon'} onClick={async () => handleLikedMessage()}>
            {liked ? (<HeartFilledIcon />) : (<HeartIcon />)}
        </Button>
    );
}
