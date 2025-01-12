import { Badge, Card, Text, ScrollArea, Box, Skeleton } from "@radix-ui/themes";

export function ToolCardLoading() {
  return (
    <div className="p-1 w-full overflow-y-scroll no-scrollbar">
      <Card>
        <Badge
          variant="surface"
          className="w-full flex  justify-center items-center"
        >
          <Skeleton />
        </Badge>
        <div className="mt-2">
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                Description
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <Skeleton />
                </Text>
              </Box>
            </ScrollArea>
          </div>
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                Script
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <Skeleton />
                </Text>
              </Box>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}
