import { Badge, Text } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";
import { ImageUploadButton } from "@/features/imageUpload/components/image-upload-button";
import { X } from "lucide-react";

interface FileUploadProps {
  imageName: string | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  handleOuterClear: () => void;
  previewUrl: string | null;
}

export function FileUpload({
  imageName,
  onFileChange,
  onClear,
  handleOuterClear,
  previewUrl,
}: FileUploadProps) {
  const handleFileValidation = (file: File | null) => {
    if (!file) {
      onFileChange(null);
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("File must be an image (JPG, PNG, WebP) or GIF");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      const blobUrl = URL.createObjectURL(
        new Blob([reader.result as ArrayBuffer], { type: file.type })
      );
      onFileChange(file);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      {imageName ? null : (
        <div>
          <ImageUploadButton
            fileName={imageName}
            onFileChange={handleFileValidation}
            onClear={onClear}
            previewUrl={previewUrl}
          />
        </div>
      )}
      {imageName && (
        <div>
          <Badge radius="full" variant="surface" color="gray" className="ml-2">
            <div className="w-full flex justify-between items-center ml-2">
              <Text weight="light" size="1">
                {imageName}
              </Text>
              <Button
                size="tiny"
                variant="ghost-no-hover"
                onClick={handleOuterClear}
              >
                <X size={10} className=""/>
              </Button>
            </div>
          </Badge>
        </div>
      )}
    </>
  );
}
