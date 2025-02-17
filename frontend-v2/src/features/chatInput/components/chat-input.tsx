import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useCallback, useEffect } from "react";
import { BaseModelEntity } from "@/types/api";
import { RocketIcon, LightbulbIcon, LightbulbOffIcon } from "lucide-react";
import { ModelSelect } from "@/features/model/components/model-select";
import { FileUpload } from "./file-upload";
import { TbTools, TbToolsOff } from "react-icons/tb";

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
    <div className="chat-input mb-2 flex flex-col w-full">
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
              />
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <ModelSelect
                    selectedModel={selectedModel}
                    models={models}
                    modelsLoading={modelsLoading}
                    onModelChange={handleModelChange}
                  />
                  <Tooltip>
                    <TooltipTrigger
                      asChild
                      onClick={handleUseToolsToggled}
                      className="hover:cursor-pointer"
                    >
                      {useTools ? (
                        <LightbulbIcon size={15} />
                      ) : (
                        <LightbulbOffIcon size={15} />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {useTools ? <p>Disable Tools</p> : <p>Enable Tools</p>}
                    </TooltipContent>
                  </Tooltip>
                  <FileUpload
                    imageName={imageName}
                    onFileChange={handleFileChange}
                    onClear={handleClear}
                    handleOuterClear={handleClear}
                    previewUrl={previewUrl}
                  />
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
