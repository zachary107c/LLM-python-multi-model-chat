import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { likeAssistantMessageMutation } from "../api/like-assistant-message";

export function LikeMessageButton({
  messageId,
  isLiked,
  conversationId,
}: {
  messageId: string;
  isLiked: boolean | undefined;
  conversationId: string;
}) {
  const likeMutation = likeAssistantMessageMutation({
    conversationId: conversationId,
  });
  const [liked, setLiked] = useState(isLiked);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  async function handleLikedMessage() {
    try {
      const response = await likeMutation.mutateAsync({
        data: { messageId: messageId, liked: !liked },
      });
      setLiked(response.liked);
    } catch (error) {
      console.error("Failed to like the message", error);
    }
  }

  return (
    <Button
      variant="ghost"
      size={"icon"}
      onClick={handleLikedMessage}
      aria-label={liked ? "Unlike" : "Like"}
    >
      {liked ? <HeartFilledIcon /> : <HeartIcon />}
    </Button>
  );
}
