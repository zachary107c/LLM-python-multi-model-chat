import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface KaTeXRendererProps {
  text: string;
}

const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ text }) => {
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g); // Detects inline ($...$) and block ($$...$$) math

  return (
    <div className="break-words">
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          return <div className="bg-red-500"><BlockMath key={index} math={part.slice(2, -2)} /></div>;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          return <div className="bg-red-500"><InlineMath key={index} math={part.slice(1, -1)} /></div>;
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default KaTeXRenderer;