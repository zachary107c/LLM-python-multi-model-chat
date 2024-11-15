import { useState, useEffect } from "react";
import { Flex, Card, Text } from "@radix-ui/themes";
import { SlashIcon, ChevronRightIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import { deleteAssistantMessageMutation } from "@/features/chatMessage/api/delete-assistant-message";
import { LikeMessageButton } from "./like-message-button";
import { DeleteMessageModal } from "./delete-message-modal";
import { AssistantMessage } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import GenerateNewMessageButton from "./generate-new-message-button";
import { Button as LocalButton } from "@/components/ui/button";

export function AssistantChatMessage({
  assistantMessageData,
}: {
  assistantMessageData: AssistantMessage;
}) {
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);

  const deleteMutation = deleteAssistantMessageMutation({
    conversationId: assistantMessageData.conversation,
  });

  // Update to show the most recent content variation by default
  useEffect(() => {
    setCurrentVariationIndex(
      assistantMessageData.content_variations.length - 1
    );
  }, [assistantMessageData.content_variations]);

  const handleNext = () => {
    setCurrentVariationIndex((prevIndex) =>
      prevIndex === assistantMessageData.content_variations.length - 1
        ? 0
        : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentVariationIndex((prevIndex) =>
      prevIndex === 0
        ? assistantMessageData.content_variations.length - 1
        : prevIndex - 1
    );
  };

  const variationsCount = assistantMessageData.content_variations.length;

  return (
    <div className="mb-2">
      <div>
        <div>
          <div className="mb-1 flex justify-start items-center">
            <div className="flex items-center">
              <Text
                color={assistantMessageData.model.color}
                className="ml-1"
                size="1"
              >
                {assistantMessageData.model.name}
              </Text>
              <Text>
                <SlashIcon />
              </Text>
              <Text weight="light" size="1">
                {new Date(assistantMessageData.created_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}
              </Text>
            </div>
          </div>
          <div className="flex justify-start">
            <Card className="w-fit flex flex-col">
              <div>
                <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
                  <Text size="2">
                    <MarkdownRenderer
                      markdown={
                        assistantMessageData.content_variations[
                          currentVariationIndex
                        ].content
                      }
                    />
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex justify-start">
        <Flex gap="0" align="center">
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
          />

          {/* Only show arrows if there are more than one variation */}
          {variationsCount > 1 && (
            <div className="flex justify-end text-center items-center">
              <LocalButton onClick={handlePrevious} variant="ghost-no-hover">
                <ChevronLeftIcon />
              </LocalButton>
              <Text size="1">{currentVariationIndex + 1}</Text>
              <LocalButton onClick={handleNext} variant="ghost-no-hover">
                <ChevronRightIcon />
              </LocalButton>
            </div>
          )}
        </Flex>
      </div>
    </div>
  );
}
