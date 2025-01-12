import React, { useEffect, useRef, useMemo } from "react";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import DOMPurify from "dompurify";
import katex from "katex";
import "katex/contrib/mhchem/mhchem.js";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

// Custom renderer for marked to handle LaTeX
const renderer = {
  text(text: string) {
    let result = text;

    // Handle inline math with single $ delimiters
    result = result.replace(/\$([^\$]+)\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { displayMode: false });
      } catch (error) {
        console.error("KaTeX error:", error);
        return math;
      }
    });

    // Handle display math with double $$ delimiters
    result = result.replace(/\$\$([^\$]+)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math, { displayMode: true });
      } catch (error) {
        console.error("KaTeX error:", error);
        return math;
      }
    });

    return result;
  },
};

const markedInstance = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

markedInstance.setOptions({
  gfm: true,
  breaks: true,
});

// Configure DOMPurify to allow KaTeX classes and attributes
const purifyConfig = {
  ADD_TAGS: [
    "math",
    "semantics",
    "mrow",
    "mi",
    "mn",
    "mo",
    "msup",
    "mfrac",
    "annotation",
  ],
  ADD_ATTR: ["xmlns", "encoding"],
  ADD_CLASS: ["katex", "katex-display", "katex-html"],
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdown,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    const html = markedInstance.parse(markdown);
    return DOMPurify.sanitize(html as string, purifyConfig);
  }, [markdown]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [sanitizedHtml]);

  // Return the component's JSX
  return (
    <div
      ref={containerRef}
      className={`font-erm prose dark:prose-invert max-w-none ${className} 
        [&>*:first-child]:mt-0 
        [&>*:last-child]:mb-0
        [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4
        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-4
        [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2
        [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4
        [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4
        [&>li]:mb-1
        [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 
        [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:my-4 
        [&>blockquote]:italic [&>blockquote]:bg-gray-50 
        dark:[&>blockquote]:bg-gray-800
        [&>table]:w-full [&>table]:border-collapse [&>table]:my-4
        [&>table_th]:border [&>table_th]:border-gray-300 [&>table_th]:p-2 
        [&>table_th]:bg-secondary
        [&>table_td]:border [&>table_td]:border-gray-300 [&>table_td]:p-2
        [&>hr]:my-8 [&>hr]:border-gray-200 dark:[&>hr]:border-gray-700
        [&>img]:max-w-full [&>img]:rounded-lg [&>img]:my-4
        [&>a]:text-blue-600 [&>a]:underline 
        hover:[&>a]:text-blue-800 dark:[&>a]:text-blue-400
        [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto
        [&_.katex]:overflow-x-auto
      `}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default MarkdownRenderer;
