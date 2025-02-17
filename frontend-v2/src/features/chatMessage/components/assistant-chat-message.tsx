import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BotIcon, ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import GenerateNewMessageButton from "./generate-new-message-button";
import { Button } from "@/components/ui/button";
import { UndoDeleteAssistantMessageButton } from "./undo-delete-assistant-message.button";
import { Avatar } from "@/components/ui/avatar";
import { SiOllama, SiOpenai, SiAnthropic } from "react-icons/si";

function localizeUTCDates(text: string) {
  const utcDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g;

  return text.replace(utcDatePattern, (match) => {
    const date = new Date(match);
    return date.toLocaleString(navigator.language, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
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
    setStreamingContent("");
  };

  const handleStreamComplete = (finalContent: string) => {
    setStreamingContent(null); // Clear streaming state
    setVariations((prev) => [...prev, { id: -1, content: finalContent }]);
    setCurrentVariationIndex((prev) => prev + 1);
  };

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

  const displayContent =
    streamingContent !== null
      ? streamingContent
      : variations[currentVariationIndex]?.content;

  const PROVIDER_ICONS: Record<string, JSX.Element> = {
    ollama: <SiOllama color="hsl(var(--primary-foreground))"/>,
    openai: <SiOpenai color="hsl(var(--primary-foreground))"/>,
    anthropic: <SiAnthropic color="hsl(var(--primary-foreground))"/>,
  };

  type ProviderType = "ollama" | "openai" | "anthropic";

  return (
    <div className="flex items-start gap-2 mb-2">
      <Avatar className="rounded-md h-8 w-8 bg-primary flex justify-center items-center">
        {PROVIDER_ICONS[
          assistantMessageData.model.provider as ProviderType
        ] || <BotIcon color="hsl(var(--primary-foreground))"/>}
      </Avatar>
      <div className="flex flex-col">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-primary font-bold">
              {assistantMessageData.model.name}
            </span>
            <span className="text-xs">
              {new Date(assistantMessageData.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </span>
          </div>
          <Card className="w-full bg-transparent shadow-none border-none text-sm">
            <MarkdownRenderer content={localizeUTCDates(displayContent)} />
          </Card>
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
            <div className="flex gap-2 items-center">
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
                    className="p-1 m-0 text-primary text-xs min-h-0 h-6"
                    variant="secondary"
                  >
                    {tool.name}
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
