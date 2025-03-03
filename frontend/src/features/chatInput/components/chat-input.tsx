import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useCallback, useEffect } from "react";
import { BaseModelEntity } from "@/types/api";
import { RocketIcon, LightbulbIcon, LightbulbOffIcon } from "lucide-react";
import { ModelSelect } from "@/features/model/components/model-select";
import { FileUpload } from "./file-upload";
import { PulseLoader } from "react-spinners";

interface Props {
  onSendMessage: (message: string, useTools: boolean) => void;
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
  const [useTools, setUseTools] = useState(false);

  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSendMessage(newMessage, useTools);
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
      setTextAreaHeight(Math.min(textAreaHeight + 24, 240));
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSendMessage(newMessage, useTools);
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

  function handleUseToolsToggled() {
    setUseTools(!useTools);
  }

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);
        setImageData(file);
        setImageName(file.name);
        onImageDataChange(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleClear = useCallback(() => {
    onImageDataChange(null);
    setImageData(null);
    setImageName(null);
    setPreviewUrl(null);
  }, []);

  return (
    <div className="chat-input mb-2 flex flex-col w-full gap-2">
      {isLoading && (
        <div className="absolute pl-3 pt-1 flex items-center justify-start gap-1 bg-transparent">
          <span className="text-xs text-muted-foreground italic">
            {selectedModel?.name} thinking
          </span>
          <PulseLoader color="hsl(var(--primary))" size={3} />
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex justify-between">
        <Card className="w-full p-2 bg-sidebar shadow-none rounded-lg">
          <div className={`flex justify-between items-center h-full`}>
            <div className="flex flex-col w-full">
              <Textarea
                className="outline-none border-none w-full py-3 px-1 resize-none no-scrollbar focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 shadow-none min-h-[48px]"
                onChange={(event) => setNewMessage(event.target.value)}
                value={newMessage}
                placeholder="Type your message here"
                onKeyDown={handleKeyDown}
                style={{ height: `${textAreaHeight}px` }}
                disabled={isLoading}
              />
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1">
                  <ModelSelect
                    selectedModel={selectedModel}
                    models={models}
                    modelsLoading={modelsLoading}
                    onModelChange={handleModelChange}
                    variant="secondary"
                    className="bg-accent-2 hover:bg-primary/50"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild onClick={handleUseToolsToggled}>
                      <div className="hover:cursor-pointer p-2 flex justify-center items-center">
                        {useTools ? (
                          <LightbulbIcon size={15} />
                        ) : (
                          <LightbulbOffIcon size={15} />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {useTools ? <p>Disable Tools</p> : <p>Enable Tools</p>}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FileUpload
                        imageName={imageName}
                        onFileChange={handleFileChange}
                        onClear={handleClear}
                        handleOuterClear={handleClear}
                        previewUrl={previewUrl}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload Image</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button type="submit" variant="default" size="sm">
                  <span className="text-sm">Submit</span>
                  <RocketIcon size={15} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
