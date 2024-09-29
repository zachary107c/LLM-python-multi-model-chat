import { useGetModelQuery } from "@/features/model/api/get-model-info"
import { ModelCard } from "@/features/model/components/model-card";
import { ModelCardLoading } from "@/features/model/components/model-card-loading";


export function ModelInfo({ modelId }: { modelId: number | null}) {
    const { data, isLoading, error } = useGetModelQuery({ modelId: modelId });

    if (isLoading) {
        return (
            <div className="w-full h-full flex justify-center p-4">
                <ModelCardLoading />
            </div>
        );
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div className="w-full h-full flex justify-center p-4">
            <ModelCard data={data} />
        </div>
    )
}