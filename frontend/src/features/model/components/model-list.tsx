import { Button } from "@/components/ui/button";
import { BaseModelEntity } from "@/types/api";
import { UpdateModelModal } from "./edit-model-modal";


export function ModelList({ models, selectedModelId, handleSetSelected }: { models: BaseModelEntity[] | undefined, selectedModelId: number | null, handleSetSelected: any }) {
    return (
        <div>
            {models?.map((model) => (
                <div className="w-full flex justify-between items-center">
                    <div className="w-full overflow-hidden">
                            {model.id === selectedModelId ?
                                <Button size='sm' variant={'ghost'} className="w-full justify-between bg-accent text-accent-foreground" onClick={() => handleSetSelected(model.id)}>
                                    {model.name}
                                </Button>
                                :
                                <Button size='sm' variant={'ghost'} className="w-full justify-between " onClick={() => handleSetSelected(model.id)}>
                                    {model.name}
                                </Button>
                            }
                    </div>
                    <UpdateModelModal modelId={model.id} />
                </div>
            ))}
        </div>
    );
}