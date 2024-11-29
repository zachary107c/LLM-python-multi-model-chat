import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, Text } from "@radix-ui/themes";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { ToolList } from "./tools-list";
import { ToolListLoading } from "./tools-list-loading";
import { useGetToolsQuery } from "../api/get-tools";

export function Tools({ selectedToolId, onSelectedToolIdChange }: any) {
  const [expanded, setExpanded] = useState(true);
  const { data: tools, isLoading } = useGetToolsQuery();

  function handleSetExpanded(e: any) {
    setExpanded(e);
  }

  function handleSetSelected(toolId: string) {
    if (tools !== null && tools !== undefined) {
      onSelectedToolIdChange(toolId);
    }
  }

  function handleNewModel() {
    console.log("New Tool");
  }

  useEffect(() => {
    if (tools && tools.length > 0) {
      onSelectedToolIdChange(tools[0].id);
    }
  }, [tools]);

  return (
    <div
      className={`${expanded ? "w-[250px] max-w-[250px] h-full" : "h-full"}`}
    >
      {!expanded && (
        <div className="overflow-y-scroll no-scrollbar border-r border-[#7d7d7d68] h-full">
          <div className="mx-2 mt-2">
            <Button variant={"ghost"} className="p-2">
              <PinRightIcon onClick={() => handleSetExpanded(true)} />
            </Button>
          </div>
        </div>
      )}
      <div
        className={`${
          expanded ? "overflow-y-scroll no-scrollbar" : "hidden"
        } border-r border-[#7d7d7d68] w-full h-full`}
      >
        <div className="flex justify-between items-center mx-2 mt-2">
          <Button variant="ghost" className="p-2">
            <PinLeftIcon onClick={() => handleSetExpanded(false)} />
          </Button>
          <Tooltip content="New Model" side="right">
            <Button
              variant="ghost"
              className="ml-2 p-2"
              onClick={async () => handleNewModel()}
            >
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
        <div className="mx-2">
          <div className="flex flex-col justify-center align-top">
            <div className="flex flex-col w-full">
              <div>
                <Text weight="bold">Tools</Text>
                {isLoading ? (
                  <ToolListLoading />
                ) : (
                  <ToolList
                    tools={tools}
                    selectedToolId={selectedToolId}
                    handleSetSelected={handleSetSelected}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
