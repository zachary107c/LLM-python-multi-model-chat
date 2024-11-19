import { Text, Button, DropdownMenu, Skeleton, Badge } from "@radix-ui/themes";
import { BaseModelEntity, ModelDetail } from "@/types/api";

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="surface"
          color={selectedModel?.color || "gray"}
          size="1"
        >
          {modelsLoading ? (
            <Skeleton width="60px" />
          ) : (
            selectedModel?.name || "Select a model"
          )}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {groupedModels &&
          Object.keys(groupedModels).map((provider) => (
            <DropdownMenu.Group key={provider}>
              <Badge variant="soft" className="w-full" color="gray">
                <Text size="2" weight="bold">
                  {provider}
                </Text>
              </Badge>
              {groupedModels[provider].map((model) => (
                <DropdownMenu.Item
                  onClick={() => onModelChange(model)}
                  key={model.id}
                  color={model.color}
                >
                  <Text size="1" weight="regular">
                    {model.model}
                  </Text>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}