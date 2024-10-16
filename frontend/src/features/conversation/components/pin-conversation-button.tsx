import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartCrack } from "lucide-react";
import { likeConversationMutation } from "@/features/conversation/api/like-conversation";

export function PinConversationButton({
  isLiked,
  conversationId,
}: {
  isLiked: boolean | undefined;
  conversationId: string;
}) {
  const likeMutation = likeConversationMutation({
    conversationId: conversationId,
  });
  const [liked, setLiked] = useState(isLiked);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  async function handleLikedConversation() {
    try {
      const response = await likeMutation.mutateAsync({
        data: { liked: !liked },
      });

      setTimeout(() => {
        setLiked(response.liked);
      }, 500);
    } catch (error) {
      console.error("Failed to like the conversation ", error);
    }
  }

  return (
    <Button
      variant="ghost"
      size={"icon"}
      onClick={handleLikedConversation}
      aria-label={liked ? "Unbookmark" : "Bookmark"}
      className="p-2 w-full flex justify-start"
    >
      {liked ? (
        <>
          <HeartCrack size={15} className="mr-2" />
          <div className="w-full text-left">Breakup</div>
        </>
      ) : (
        <>
          <Heart size={15} className="mr-2" />
          <div className="w-full text-left">Love</div>
        </>
      )}
    </Button>
  );
}
