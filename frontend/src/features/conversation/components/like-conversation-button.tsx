import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, BookmarkFilledIcon } from "@radix-ui/react-icons";
import { likeConversationMutation } from "@/features/conversation/api/like-conversation";

export function BookmarkConversationButton({ isLiked, conversationId }: { isLiked: boolean | undefined, conversationId: string }) {
    const likeMutation = likeConversationMutation({ conversationId: conversationId });
    const [liked, setLiked] = useState(isLiked);

    useEffect(() => {
        setLiked(isLiked);
    }, [isLiked]);

    async function handleLikedConversation() {
        try {
            const response = await likeMutation.mutateAsync({ data: { liked: !liked } });
            setLiked(response.liked);
        } catch (error) {
            console.error("Failed to like the conversation ", error);
        }
    }

    return (
        <Button
            variant='ghost'
            size={'icon'}
            onClick={handleLikedConversation}
            aria-label={liked ? "Unbookmark" : "Bookmark"}>
            {liked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
        </Button>
    );
}