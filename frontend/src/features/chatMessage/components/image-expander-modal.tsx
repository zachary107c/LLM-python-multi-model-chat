import { Dialog, Inset } from "@radix-ui/themes";
import { Button as LocalButton } from "@/components/navigation/ui/button";

interface ImageExpandModalProps {
  imagePath: string;
}

export function ImageExpandModal({ imagePath }: ImageExpandModalProps) {
  return (
    <Inset clip="padding-box" side="top" pb="current">
      <Dialog.Root>
        <Dialog.Trigger>
          <LocalButton variant={"ghost-no-hover"} className="p-0 m-0 w-full">
            <img
              src={imagePath}
              alt="Bold typography"
              style={{
                display: "block",
                objectFit: "cover",
                width: "100%",
                height: 140,
                backgroundColor: "var(--gray-5)",
              }}
            />
          </LocalButton>
        </Dialog.Trigger>
        <Dialog.Content size="1">
          <div className="flex flex-col justify-start">
            <img
              src={imagePath}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                borderRadius: "var(--radius-2)",
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Inset>
  );
}
