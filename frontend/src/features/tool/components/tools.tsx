import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, Text } from "@radix-ui/themes";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { ToolList } from "./tools-list";
import { ToolListLoading } from "./tools-list-loading";
import { useGetToolsQuery } from "../api/get-tools";
import { createToolMutation } from "../api/create-tool";

interface ToolsProps {
  selectedToolId: string | null;
  onSelectedToolIdChange: (toolId: string) => void;
}

export function Tools({ selectedToolId, onSelectedToolIdChange }: ToolsProps) {
  const { data: tools = [], isLoading } = useGetToolsQuery();
  const createMutation = createToolMutation();

  useEffect(() => {
    if (tools && tools.length > 0 && !selectedToolId) {
      onSelectedToolIdChange(tools[0].id);
    }
  }, [tools, onSelectedToolIdChange, selectedToolId]);

  const handleNewTool = async () => {
    try {
      var response = await createMutation.mutateAsync();
      onSelectedToolIdChange(response.id);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="w-[250px] max-w-[250px] h-full">
        <div className="overflow-y-scroll no-scrollbar border-r border-[#7d7d7d68] w-full h-full">
          <div className="flex justify-end items-center mx-2 mt-2">
            <Tooltip content="New Tool" side="right">
              <Button variant="ghost" className="ml-2 p-2" onClick={handleNewTool}>
                <PlusIcon />
              </Button>
            </Tooltip>
          </div>
          <div className="mx-2">
            <div className="flex flex-col justify-center align-top">
              <div className="flex flex-col w-full">
                <Text weight="bold">Tools</Text>
                {isLoading ? <ToolListLoading /> : (
                  <ToolList
                    tools={tools}
                    selectedToolId={selectedToolId}
                    handleSetSelected={onSelectedToolIdChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}