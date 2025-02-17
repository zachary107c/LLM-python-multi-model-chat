import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BaseModelEntity } from "@/types/api";
import { ChevronsUpDown, TextSearchIcon, BotIcon } from "lucide-react";
import { SiOllama, SiOpenai } from "react-icons/si";

interface ModelSelectProps {
  selectedModel: BaseModelEntity | null;
  models: BaseModelEntity[] | undefined;
  modelsLoading: boolean;
  onModelChange: (model: BaseModelEntity) => void;
}

type ProviderType = "ollama" | "openai";

export function ModelSelect({
  selectedModel,
  models,
  modelsLoading,
  onModelChange,
}: ModelSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = models?.filter((model) =>
    model.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModels = filteredModels?.reduce<
    Record<string, BaseModelEntity[]>
  >((groups, model) => {
    const provider = model.provider;
    if (!groups[provider]) {
      groups[provider] = [];
    }
    groups[provider].push(model);
    return groups;
  }, {});

  const handleNewModel = (model: BaseModelEntity) => {
    onModelChange(model);
    setSearchQuery("");
  };

  function mapProvider(provider: string) {
    if (provider === "ollama") return "Ollama";
    if (provider === "openai") return "OpenAI";
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  const PROVIDER_ICONS: Record<string, JSX.Element> = {
    ollama: <SiOllama />,
    openai: <SiOpenai />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="flex justify-between pr-1"
        >
          {modelsLoading ? (
            <Skeleton className="w-[60px]" />
          ) : (
            <div className="flex items-center justify-between gap-2">
              {PROVIDER_ICONS[selectedModel?.provider as ProviderType] || (
                <BotIcon />
              )}
              {selectedModel?.name || "Select a model"}
            </div>
          )}
          <ChevronsUpDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="max-h-[30vh] overflow-y-auto p-0"
        style={{ width: "250px" }} // Set a fixed width
      >
        <div className="sticky top-0 z-10 bg-popover px-1 py-2">
          <div className="flex items-center rounded">
            <TextSearchIcon color="hsl(var(--primary))" size={15} />
            <Input
              type="text"
              className="w-full px-2 py-1 focus-visible:ring-0 focus-visible:outline-none border-none text-xs shadow-none"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col space-y-1 px-2 pb-2">
          {groupedModels &&
            Object.entries(groupedModels).map(([provider, models]) => (
              <div key={provider}>
                <div className="font-bold text-sm">{mapProvider(provider)}</div>
                {models.map((model) => (
                  <DropdownMenuItem
                    onClick={() => handleNewModel(model)}
                    key={model.id}
                    className="hover:bg-accent-2 flex"
                  >
                    <Badge
                      variant="secondary"
                      className="rounded-md text-primary"
                    >
                      {PROVIDER_ICONS[provider as ProviderType] || <BotIcon />}
                    </Badge>
                    <span className="text-left text-sm font-normal truncate ml-2">
                      {model.model}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
