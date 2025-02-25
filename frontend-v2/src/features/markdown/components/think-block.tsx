import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Adjust the import based on your project structure

interface ThinkBlockProps {
  children: string;
  isStreaming?: boolean;
}

const ThinkBlock: React.FC<ThinkBlockProps> = ({ children, isStreaming }) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          Thoughts {isStreaming && <span className="ml-2">🌀</span>}
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ThinkBlock;