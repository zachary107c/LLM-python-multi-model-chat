import { useEffect, useState } from "react";
import { Badge, Card, Text, ScrollArea, Box, TextField, Button, TextArea } from "@radix-ui/themes";
import { Tool } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";
import Editor, { useMonaco } from "@monaco-editor/react";
import { updateToolMutation } from "../api/update-tool";

interface ToolCardProps {
    data: Tool | undefined;
}

export function ToolCard({ data }: ToolCardProps) {
    const [script, setScript] = useState<string>("");
    const [name, setName] = useState<string>(data?.name || "");
    const [description, setDescription] = useState<string>(data?.description || "");
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
    const monacoInstance = useMonaco();
    const updateMutation = updateToolMutation();

    async function handleUpdate() {
        if (data) {
            await updateMutation.mutateAsync({
                data: { toolId: data?.id, updates: { name, description, script } },
            });
        }
    }

    useEffect(() => {
        if (data?.script) setScript(data.script);
        if (data?.name) setName(data.name);
        if (data?.description) setDescription(data.description);
    }, [data]);

    useEffect(() => {
        async function loadTheme() {
            if (monacoInstance) {
                const themeData = await import("monaco-themes/themes/Github Dark.json");
                monacoInstance.editor.defineTheme("gh-dark", themeData);
                monacoInstance.editor.setTheme("gh-dark");
            }
        }
        loadTheme();
    }, [monacoInstance]);

    function handleScriptChange(value: string | undefined) {
        if (value !== undefined) {
            setScript(value);
        }
    }

    const editorOptions = {
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 14,
        roundedSelection: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
    };

    return (
        <div className="p-1 w-full h-full overflow-auto">
            <Card className="flex flex-col h-full" variant="surface">
                {/* Toggleable Name Badge/TextField */}
                <div className="mb-2">
                    {isEditingName ? (
                        <TextField.Root
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => setIsEditingName(false)} // handle blur to exit edit mode
                        >
                            <TextField.Slot />
                        </TextField.Root>
                    ) : (
                        <Badge
                            variant="surface"
                            className="w-full flex justify-center items-center cursor-pointer"
                            onClick={() => setIsEditingName(true)}  // Toggle to edit
                        >
                            <Text size="4" weight="bold">
                                {name || "Unnamed Tool"}
                            </Text>
                        </Badge>
                    )}
                </div>

                {/* Description Section */}
                <div className="flex flex-col flex-1 min-h-0 mb-2">
                    <div className="flex items-center mb-1">
                        <Text as="p" size="3" weight="bold">
                            Description
                        </Text>
                        <Text
                            size="1"
                            className="ml-auto cursor-pointer text-blue-600"
                            onClick={() => setIsEditingDescription(!isEditingDescription)}
                        >
                            {isEditingDescription ? "Save" : "Edit"}
                        </Text>
                    </div>
                    {isEditingDescription ? (
                        <TextArea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => setIsEditingDescription(false)}  // handle blur to exit edit mode
                        />
                    ) : (
                        <ScrollArea type="always" scrollbars="vertical" style={{ height: 120 }}>
                            <Box p="2" pr="8">
                                <Text as="p">
                                    <MarkdownRenderer markdown={description || ""} />
                                </Text>
                            </Box>
                        </ScrollArea>
                    )}
                </div>

                {/* Script Editor */}
                <div className="flex flex-col mb-2">
                    <div className="mb-2">
                        <Text as="p" size="3" weight="bold">
                            Script
                        </Text>
                    </div>
                    <Editor
                        height="50vh"
                        defaultLanguage="python"
                        value={script}
                        onChange={handleScriptChange}
                        theme="vs-dark"
                        options={editorOptions}
                        loading={<div className="text-sm text-zinc-400">Loading editor...</div>}
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="surface"
                        color="green"
                        onClick={() => handleUpdate()}
                        size="1"
                    >
                        Save Tool Updates
                    </Button>
                </div>
            </Card>
        </div>
    );
}