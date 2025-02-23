import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGetToolQuery } from "../api/get-tool";
import { useToolId } from "../contexts/toolsContext";
import { updateToolMutation } from "../api/update-tool";
import { useToast } from "@/hooks/use-toast";

interface EditToolAreaProps {
  toolId: string;
}

const EditToolArea: React.FC<EditToolAreaProps> = ({ toolId }) => {
  const { data: tool, error, isLoading } = useGetToolQuery({ toolId });
  const [editableTool, setEditableTool] = useState(tool);
  const { toolId: _, setToolId } = useToolId();
  const updateTool = updateToolMutation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editableTool) {
      try {
        await updateTool.mutateAsync({
          data: { toolId: toolId, updates: editableTool },
        });
        toast({title: "Tool Updated", description: "Successfully updated the tool!"})
      } catch (error) {
        console.error("Error updating tool:", error);
        toast({title: "Tool Update Failed", description: "Failed to update the tool: " + error, variant: "destructive"});
      }
    }
  };

  useEffect(() => {
    if (tool) {
      setEditableTool(tool);
    }
  }, [tool]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!editableTool) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => {
          setToolId("");
        }}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tools
      </Button>
      <h1 className="text-3xl font-bold mb-8">Edit Tool</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Tool Name</Label>
          <Input
            id="name"
            value={editableTool.name}
            onChange={(e) =>
              setEditableTool({ ...editableTool, name: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={editableTool.description}
            onChange={(e) =>
              setEditableTool({ ...editableTool, description: e.target.value })
            }
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="script">Script</Label>
          <Textarea
            id="script"
            value={editableTool.script}
            onChange={(e) =>
              setEditableTool({ ...editableTool, script: e.target.value })
            }
            className="mt-1 font-mono"
            rows={10}
          />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
};

export default EditToolArea;
