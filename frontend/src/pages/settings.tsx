import { useGetModelsQuery } from "@/features/model/api/get-models";
import { ModelCard } from "@/features/model/components/model-card";

export default function SettingsPage() {
    const { data, isLoading } = useGetModelsQuery();

    if (isLoading || !data) {
        return <p>Loading...</p>;
    }

    return (
        <div className="overflow-y-scroll no-scrollbar m-4 w-full">
            <div className="overflow-y-scroll no-scrollbar">
                {data.map((model) => (
                    <ModelCard model={model.model} name={model.name} color={model.color} />
                ))}
            </div>
        </div>
    );
}
