import { useRef, useEffect } from "react";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ImageUploadButtonProps {
  fileName: string | null;
  onFileChange: (file: File | null) => void;
  onClear: () => void;
  acceptedFileTypes?: string;
  previewUrl?: string | null;
  showPreview?: boolean;
}

export function ImageUploadButton({
  fileName,
  onFileChange,
  acceptedFileTypes = "image/jpeg,image/png,image/gif,image/webp,image/heic",
  previewUrl,
  showPreview = false,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const validTypes = acceptedFileTypes.split(",");

      const fileTypeValid = file.type && validTypes.includes(file.type);
      const fileNameValid = validTypes.some((type) =>
        file.name.toLowerCase().endsWith(type.split("/").pop()!)
      );

      if (!fileTypeValid && !fileNameValid) {
        alert(
          `Please upload a valid image file (${validTypes.join(
            ", "
          )}). You provided ${file.type || file.name}`
        );
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("File size exceeds 10MB limit");
        return;
      }

      onFileChange(file);
    }
  };

  useEffect(() => {
    if (fileName === null) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [fileName]);

  return (
    <div className="flex justify-center items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        aria-label="Upload image"
      />
      <div className="flex items-center justify-center">
        {showPreview && previewUrl && (
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={previewUrl} alt="image" />
            <AvatarFallback className="rounded-lg">BS</AvatarFallback>
          </Avatar>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleUploadClick}
          aria-label="Upload image"
          type="button"
          className="flex items-center justify-center w-8 h-8 p-1"
        >
          <Image size={15} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
