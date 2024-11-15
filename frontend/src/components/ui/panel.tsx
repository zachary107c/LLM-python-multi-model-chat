import { Card, Text, Badge } from "@radix-ui/themes";
import MarkdownRenderer from "@/features/markdown/components/markdown";

export default function Panel({
  title,
  role,
  name,
  color,
  text,
  image,
  className,
  children,
}: any) {
  return (
    <div>
      {title && (
        <div
          className={`mb-1 flex ${
            role === "user" ? "justify-end" : "justify-start"
          } items-center ${className}`}
        >
          {name !== "user" &&
            name !== undefined &&
            name !== "" &&
            name !== null && (
              <div className="flex items-center">
                <Badge
                  variant="surface"
                  color={color}
                  className="mr-1"
                  radius="large"
                >
                  {name}
                </Badge>
              </div>
            )}
        </div>
      )}
      <div
        className={`flex ${
          role === "user" ? "justify-end" : "justify-start"
        } rainbow-border-always`}
      >
        <Card className="w-fit flex flex-col">
          {image}
          <div>
            <div className="overflow-y-scroll overflow-x-scroll no-scrollbar">
              {text && (
                <Text size="2">
                  <MarkdownRenderer markdown={text} />
                </Text>
              )}
              {children}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
