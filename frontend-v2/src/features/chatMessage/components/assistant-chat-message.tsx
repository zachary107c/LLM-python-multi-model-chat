import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BotIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  InfoIcon,
} from "lucide-react";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import GenerateNewMessageButton from "./generate-new-message-button";
import { Button } from "@/components/ui/button";
import { UndoDeleteAssistantMessageButton } from "./undo-delete-assistant-message.button";
import { Avatar } from "@/components/ui/avatar";
import {
  SiOllama,
  SiOpenai,
  SiAnthropic,
  SiGooglegemini,
} from "react-icons/si";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

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
    ollama: <SiOllama color="hsl(var(--primary-foreground))" />,
    openai: <SiOpenai color="hsl(var(--primary-foreground))" />,
    anthropic: <SiAnthropic color="hsl(var(--primary-foreground))" />,
    google: <SiGooglegemini color="hsl(var(--primary-foreground))" />,
  };

  type ProviderType = "ollama" | "openai" | "anthropic";

  return (
    <div className="flex items-start gap-2 mb-2">
      <Avatar className="rounded-md h-8 w-8 bg-primary flex justify-center items-center">
        {PROVIDER_ICONS[
          assistantMessageData.model.provider as ProviderType
        ] || <BotIcon color="hsl(var(--primary-foreground))" size={17} />}
      </Avatar>
      <div className="flex flex-col">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm text-primary font-bold">
              {assistantMessageData.model.name}
            </span>
            <Badge
              className="p-1 m-0 text-primary text-xs min-h-0 h-5 flex justify-between items-center gap-1"
              variant="secondary"
            >
              <span className="text-xs">
                @
                {new Date(assistantMessageData.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </Badge>
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
                  <Button onClick={handlePrevious} variant="ghostNoHover">
                    <ChevronLeftIcon className="!size-3" />
                  </Button>
                  <span className="text-xs font-light">
                    {currentVariationIndex + 1}
                  </span>
                  <Button onClick={handleNext} variant="ghostNoHover">
                    <ChevronRightIcon className="size-3" />
                  </Button>
                </div>
              )}

              {assistantMessageData.tools_used &&
                assistantMessageData.tools_used.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        key={`assistant-tools-${assistantMessageData.id}`}
                        className="p-2 m-0 text-primary text-xs min-h-0 h-5 flex justify-between items-center gap-1"
                        variant="secondary"
                      >
                        <InfoIcon size={12} />
                        Tools Used
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="flex flex-col justify-center items-start gap-2 border bg-background"
                    >
                      <span className="text-foreground text-md font-bold">
                        Function Calls
                      </span>
                      <Separator className="bg-primary/80" />
                      {assistantMessageData.tools_used.map((tool, index) => (
                        <div
                          key={index}
                          className="flex flex-col justify-center items-start p-1 text-foreground gap-2"
                        >
                          {Object.entries(tool.arguments).length > 0 ? (
                            Object.entries(tool.arguments).map(
                              ([key, value], argIndex) => (
                                <div
                                  key={argIndex}
                                  className="w-full flex justify-between items-center"
                                >
                                  <pre>
                                    <span className="text-primary">
                                      {tool.name}
                                    </span>
                                    ({key}=
                                    <span className="text-chart-2">
                                      "{value}"
                                    </span>
                                    )
                                  </pre>
                                </div>
                              )
                            )
                          ) : (
                            <div className="w-full flex justify-between items-center">
                              <pre>
                                <span className="text-primary">
                                  {tool.name}
                                </span>
                                ()
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
