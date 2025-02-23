import { useState } from "react";
import { Search, Copy, Edit, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetToolsQuery } from "@/features/tools/api/get-tools";
import { createToolMutation } from "../api/create-tool";
import { useToast } from "@/hooks/use-toast";
import { useToolId } from "../contexts/toolsContext";
import { DeleteToolModal } from "./delete-tool-modal";

export function ToolsArea() {
  const [searchTerm, setSearchTerm] = useState("");
  const createMutation = createToolMutation();
  const { data: tools, isLoading: toolsLoading } = useGetToolsQuery();
  const { toast } = useToast();
  const { toolId, setToolId } = useToolId();

  if (toolsLoading || tools === undefined) {
    return <div>Loading Tools . . .</div>;
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewTool = async () => {
    try {
      var response = await createMutation.mutateAsync();
      setToolId(response.id);
    } catch (e) {
      console.log(e);
    }
  };

  const copyScript = (script: string) => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Tool script copied to the clipboard.",
        });
      })
      .catch((err) => {
        toast({
          title: "Copied!",
          description: "Failed to copy the tool script to the clipboard.",
          variant: "destructive",
        });
        console.error("Failed to copy script: ", err);
      });
  };

  const editTool = (id: string) => {
    setSearchTerm("");
    setToolId(id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!toolId && (
        <>
          <h1 className="text-3xl font-bold mb-8">My Tools</h1>
          <div className="flex items-center mb-6">
            <div className="relative flex-grow">
              <Search
                size={15}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                color="hsl(var(--muted-foreground))"
              />
              <Input
                type="text"
                placeholder="Search tools..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleNewTool} className="ml-4">
              <Plus className="w-4 h-4 mr-2" />
              New Tool
            </Button>
          </div>
          <div className="overflow-y-auto h-[100vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <Card key={tool.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500">
                      Last updated:{" "}
                      {new Date(tool.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={() => copyScript(tool.script)}
                      className="flex-1 mr-2"
                      variant="outline"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => editTool(tool.id)}
                      className="flex-1 mx-2 bg-accent-2 hover:bg-primary/50 transition-colors duration-200 w-full text-foreground"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <DeleteToolModal toolId={tool.id} />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
