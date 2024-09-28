import React, { useEffect, useRef, useMemo } from "react";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Changed to GitHub style
import DOMPurify from "dompurify";

interface MarkdownRendererProps {
  markdown: string;
}

const markedInstance = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// Configure marked for better rendering
markedInstance.setOptions({
  gfm: true,
  breaks: true,
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    const html = markedInstance.parse(markdown);
    return DOMPurify.sanitize(html as string);
  }, [markdown]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [sanitizedHtml]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default MarkdownRenderer;