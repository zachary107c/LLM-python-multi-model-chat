import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlashIcon, ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import GenerateNewMessageButton from "./generate-new-message-button";
import { Button } from "@/components/ui/button";
import { UndoDeleteAssistantMessageButton } from "./undo-delete-assistant-message.button";

function localizeUTCDates(text: string) {
  // Regular expression to match ISO 8601 UTC datetime format
  const utcDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g;

  return text.replace(utcDatePattern, (match) => {
    const date = new Date(match);
    return date.toLocaleString(navigator.language, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
    });
  });
}

export function AssistantChatMessage({
  assistantMessageData,
}: {
  assistantMessageData: AssistantMessage;
}) {
  const [variations, setVariations] = useState(
    assistantMessageData.content_variations
  );
  const [currentVariationIndex, setCurrentVariationIndex] = useState(
    variations.length - 1
  );
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const deleteMutation = deleteAssistantMessageMutation({
    conversationId: assistantMessageData.conversation,
  });

  const handleUpdateContent = (newContent: string) => {
    setStreamingContent(newContent);
  };

  const handleRegenerate = () => {
    setStreamingContent(""); // Start with empty content for streaming
    // Don't create a new variation here - wait for the streaming to complete
  };

  const handleStreamComplete = (finalContent: string) => {
    setStreamingContent(null); // Clear streaming state
    setVariations((prev) => [...prev, { id: -1, content: finalContent }]);
    setCurrentVariationIndex((prev) => prev + 1);
  };

  // Reset when content variations change from the server
  useEffect(() => {
    setVariations(assistantMessageData.content_variations);
    setCurrentVariationIndex(
      assistantMessageData.content_variations.length - 1
    );
    setStreamingContent(null);
  }, [assistantMessageData.content_variations]);

  const handleNext = () => {
    setCurrentVariationIndex(
      (prevIndex) => (prevIndex + 1) % variations.length
    );
  };

  const handlePrevious = () => {
    setCurrentVariationIndex(
      (prevIndex) => (prevIndex - 1 + variations.length) % variations.length
    );
  };

  // Show either streaming content or current variation
  const displayContent =
    streamingContent !== null
      ? streamingContent
      : variations[currentVariationIndex]?.content;

  return (
    <div className="mb-2">
      <div>
        <div>
          <div className="mb-1 flex justify-start items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">{assistantMessageData.model.name}</span>
              <span className="font-light text-sm">
                {new Date(assistantMessageData.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    // second: "2-digit",
                  }
                )}
              </span>
            </div>
          </div>
          <div className="w-full">
            <Card className="w-full bg-transparent shadow-none border-none">
              <div className="max-w-full overflow-hidden">
                <div className="text-sm">
                  <MarkdownRenderer
                    content={localizeUTCDates(displayContent)}
                    className="max-w-full" // Ensure markdown content doesn't exceed container
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        {assistantMessageData.is_deleted ? (
          assistantMessageData.recoverable ? (
            <div className="flex justify-end">
              <div className="flex gap-0 align-middle">
                <UndoDeleteAssistantMessageButton
                  messageId={assistantMessageData.id}
                  conversationId={assistantMessageData.conversation}
                />
              </div>
            </div>
          ) : (
            <></>
          )
        ) : (
          <div className="flex gap-1 align-middle">
            <DeleteMessageModal
              messageId={assistantMessageData.id}
              deleteMutation={deleteMutation}
            />
            <LikeMessageButton
              messageId={assistantMessageData.id}
              isLiked={assistantMessageData.liked}
              conversationId={assistantMessageData.conversation}
            />
            <GenerateNewMessageButton
              assistantMessage={assistantMessageData}
              conversationId={assistantMessageData.conversation}
              onUpdateContent={handleUpdateContent}
              onRegenerate={handleRegenerate}
              onStreamComplete={handleStreamComplete}
            />

            {/* Only show arrows if there are more than one variation and not streaming */}
            {variations.length > 1 && streamingContent === null && (
              <div className="flex justify-end text-center items-center">
                <Button onClick={handlePrevious} variant="ghost">
                  <ChevronLeftIcon />
                </Button>
                <span className="text-sm font-light">
                  {currentVariationIndex + 1}
                </span>
                <Button onClick={handleNext} variant="ghost">
                  <ChevronRightIcon />
                </Button>
              </div>
            )}
            {assistantMessageData.tools_used &&
              assistantMessageData.tools_used?.length > 0 &&
              assistantMessageData.tools_used.map((tool, index) => (
                <Badge
                  key={tool.name + index}
                  className="p-1 m-1 border-none bg-background text-xs"
                  variant="outline"
                >
                  {tool.name}
                </Badge>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
