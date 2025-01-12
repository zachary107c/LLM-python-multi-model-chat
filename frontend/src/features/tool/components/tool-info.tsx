import { useGetToolQuery } from "../api/get-tool";
import { ToolCard } from "./tool-card";
import { ToolCardLoading } from "./tool-card-loading";

export function ToolInfo({ toolId }: { toolId: string | null }) {
  const { data, isLoading, error } = useGetToolQuery({ toolId: toolId });

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center p-4">
        <ToolCardLoading />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="w-full h-full flex justify-center p-4">
      <ToolCard data={data} />
    </div>
  );
}
