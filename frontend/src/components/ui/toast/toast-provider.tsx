import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Progress, Callout, Badge } from '@radix-ui/themes';
import {
    CheckCircledIcon,
    CrossCircledIcon,
    Cross2Icon,
} from "@radix-ui/react-icons";
import { Button as LocalButton } from "@/components/ui/button";

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info'; // Add more types if needed
    duration: number; // Duration in milliseconds
}

interface ToastContextProps {
    toasts: Toast[];
    addToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (
        message: string,
        type: 'success' | 'error' | 'info',
        duration: number = 5000 // Default duration of 5 seconds
    ) => {
        const id = Math.random().toString(36).substr(2, 9); // Generate a unique ID
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        setTimeout(() => removeToast(id), duration); // Auto-remove toast after the duration
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastItemProps {
    toast: Toast;
    removeToast: (id: string) => void;
}

const ToastItem = ({ toast, removeToast }: ToastItemProps) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => Math.max(prev - 100 / (toast.duration / 100), 0));
        }, 100);

        return () => clearInterval(interval);
    }, [toast.duration]);

    return (
        <Callout.Root
            color={toast.type === "success" ? "green" : toast.type === "info" ? "blue" : "red"}
            role="alert"
            style={{
                animation: "slideIn 0.3s ease-out, slideOut 0.3s ease-in forwards",
                animationDelay: "0s, 4.7s",
                position: "relative",
                overflow: "hidden",
            }}
            variant="surface"
            size="1"
        >
            <div className="flex items-center justify-between w-full">
                <Badge variant="solid">
                    <Callout.Icon className="mr-1">
                        {toast.type === "success" ? <CheckCircledIcon /> : <CrossCircledIcon />}
                    </Callout.Icon>
                    <Callout.Text size="1">{toast.message}</Callout.Text>
                    <LocalButton
                        onClick={() => removeToast(toast.id)}
                        variant="ghost-no-hover"
                        className="m-1 p-0"
                    >
                        <Cross2Icon />
                    </LocalButton>
                </Badge>
            </div>
            <Progress value={progress} />
        </Callout.Root>
    );
};
