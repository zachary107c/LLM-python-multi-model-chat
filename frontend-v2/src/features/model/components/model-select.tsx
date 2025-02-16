import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BaseModelEntity } from "@/types/api";
import { ChevronsUpDown } from "lucide-react";

interface ModelSelectProps {
  selectedModel: BaseModelEntity | null;
  models: BaseModelEntity[] | undefined;
  modelsLoading: boolean;
  onModelChange: (model: BaseModelEntity) => void;
}

export function ModelSelect({
  selectedModel,
  models,
  modelsLoading,
  onModelChange
}: ModelSelectProps) {
  const groupedModels = models?.reduce((acc, model) => {
    const { provider } = model;
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, BaseModelEntity[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='default'
          size="sm"
          className="flex justify-between pr-1"
        >
          {modelsLoading ? (
            <Skeleton className="w-[60px]" />
          ) : (
            selectedModel?.name || "Select a model"
          )}
          <ChevronsUpDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="h-[30vh] overflow-y-scroll">
        {groupedModels &&
          Object.keys(groupedModels).map((provider) => (
            <DropdownMenuGroup key={provider}>
              <Badge variant='default' className="w-full hover:none">
                <span className="text-sm font-bold hover:none">
                  {provider}
                </span>
              </Badge>
              {groupedModels[provider].map((model) => (
                <DropdownMenuItem
                  onClick={() => onModelChange(model)}
                  key={model.id}
                  className="hover:bg-secondary"
                >
                  <span className="text-sm font-normal">
                    {model.model}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}