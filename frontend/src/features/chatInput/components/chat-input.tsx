import { Text, Button, Card } from "@radix-ui/themes";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useEffect } from "react";
import { BaseModelEntity } from "@/types/api";
import { Button as LocalButton } from "@/components/ui/button";
import { Rocket, Folder } from "lucide-react";
import { ModelSelect } from "@/features/model/components/model-select";
import { FileUpload } from "./file-upload";

interface Props {
  onSendMessage: (message: string) => void;
  onModelChange: (model: BaseModelEntity) => void;
  onImageDataChange: (model: File | null) => void;
  selectedModel: BaseModelEntity | null;
  models: BaseModelEntity[] | undefined;
  modelsLoading: boolean;
  isLoading: boolean;
}

export function ChatInput({
  onSendMessage,
  onModelChange,
  onImageDataChange,
  selectedModel,
  models,
  modelsLoading,
  isLoading,
}: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState(48);
  const [imageName, setImageName] = useState<string | null>(null);
  const [_, setImageData] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSendMessage(newMessage);
    setNewMessage("");
    setTextAreaHeight(48);
    handleClear();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleKeyDown = (event: any) => {
    if (event.shiftKey && event.key === "Enter") {
      setTextAreaHeight(Math.min(textAreaHeight + 24, 240)); // Limit expansion to 240px
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSendMessage(newMessage);
      setNewMessage("");
      setTextAreaHeight(48);
      handleClear();
    } else if (event.key === "Backspace" && textAreaHeight > 48) {
      if (newMessage.endsWith("\n")) {
        setTextAreaHeight(Math.max(textAreaHeight - 24, 48));
      }
    }
  };

  function handleModelChange(model: BaseModelEntity) {
    onModelChange(model);
  }

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        // Create blob URL for preview
        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);
        // Store the original file for upload
        setImageData(file);
        setImageName(file.name);
        onImageDataChange(file);
      };
      reader.readAsDataURL(file); // Changed from readAsArrayBuffer
    }
  }, []);

  const handleClear = useCallback(() => {
    onImageDataChange(null);
    setImageData(null);
    setImageName(null);
    setPreviewUrl(null);
  }, []);

  return (
    <div
      className={`chat-input mb-4 flex flex-col w-full ${
        isLoading ? "chat-input-border" : ""
      }`}
    >
      <form onSubmit={handleSendMessage} className="flex justify-between">
        <Card
          className={`w-full`}
          style={
            {
              "--base-card-padding-top": "var(--space-1)",
              "--base-card-padding-bottom": "var(--space-1)",
              "--base-card-padding-left": "var(--space-2)",
              "--base-card-padding-right": "var(--space-2)",
            } as any
          }
          size="1"
          variant="classic"
        >
          <div className={`flex justify-between items-center h-full`}>
            <div className="flex flex-col w-full">
              <Textarea
                className="outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar"
                onChange={(event) => setNewMessage(event.target.value)}
                value={newMessage}
                placeholder="Type your message here"
                onKeyDown={handleKeyDown}
                style={{ height: `${textAreaHeight}px` }}
              />
              <div className="flex justify-between items-center">
                <div className="mr-2">
                  <div className="flex items-center">
                    <ModelSelect
                      selectedModel={selectedModel}
                      models={models}
                      modelsLoading={modelsLoading}
                      onModelChange={handleModelChange}
                    />
                    <div className="ml-2">
                      <LocalButton variant="ghost-no-hover" className="m-1 p-0">
                        <Folder size={15} strokeWidth={1.5} />
                      </LocalButton>
                    </div>
                    <FileUpload
                      imageName={imageName}
                      onFileChange={handleFileChange}
                      onClear={handleClear}
                      handleOuterClear={handleClear}
                      previewUrl={previewUrl}
                    />
                  </div>
                </div>
                <Button type="submit" size="1" variant="surface" color="green">
                  <Text size="1">Submit</Text>
                  <Rocket size={15} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
