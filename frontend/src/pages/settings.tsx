import { useState } from "react";
import { Models } from "@/features/model/components/models";
import { ModelInfo } from "@/features/model/components/model-info";

export default function SettingsPage() {
    const [selectedModelId, setSelectedModelId] = useState<number>(-1);

    return (
        <div className="w-full h-screen flex overflow-hidden">
            <Models selectedModelId={selectedModelId} onSelectedModelIdChange={setSelectedModelId} />
            <div className="w-full h-full flex flex-col justify-between">
                <ModelInfo modelId={selectedModelId} />
            </div>
        </div>
    );
};