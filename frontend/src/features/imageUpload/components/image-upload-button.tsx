import { useRef, useEffect } from 'react'
import { ImageIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'

interface ImageUploadButtonProps {
    fileName: string | null
    onFileChange: (file: File | null) => void
    onClear: () => void
}

export function ImageUploadButton({ fileName, onFileChange }: ImageUploadButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            onFileChange(file);
        }
    }

    useEffect(() => {
        if (fileName === null) {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }, [fileName])

    return (
        <div className="flex flex-col items-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload image"
            />
            <div className="flex">
                <Button
                    variant="ghost-no-hover"
                    size="icon"
                    onClick={handleUploadClick}
                    aria-label="Upload image"
                    type="button"
                >
                    <ImageIcon />
                </Button>
            </div>
        </div>
    )
}