import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { cn } from "@/lib/utils";
import 'katex/dist/katex.min.css';

interface MarkdownStyles {
  container?: string;
  headings?: {
    h1?: string;
    h2?: string;
    h3?: string;
  };
  lists?: {
    ul?: string;
    ol?: string;
    li?: string;
  };
  blockquote?: string;
  table?: {
    container?: string;
    th?: string;
    td?: string;
  };
  hr?: string;
  image?: string;
  link?: string;
  math?: {
    display?: string;
    inline?: string;
  };
  code?: {
    block?: string;
    inline?: string;
  };
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  styles?: MarkdownStyles;
}

const defaultStyles: MarkdownStyles = {
  container: "font-erm prose dark:prose-invert max-w-none overflow-x-auto break-words",
  headings: {
    h1: "text-3xl font-bold mt-8 mb-4 break-words",
    h2: "text-2xl font-bold mt-6 mb-4 break-words",
    h3: "text-xl font-bold mt-4 mb-2 break-words",
  },
  lists: {
    ul: "list-disc ml-6 mb-4",
    ol: "list-decimal ml-6 mb-4",
    li: "mb-1 break-words",
  },
  blockquote: "border-l-4 border-gray-300 pl-4 py-1 my-4 italic bg-gray-50 dark:bg-gray-800 break-words",
  table: {
    container: "w-full border-collapse my-4 overflow-x-auto block",
    th: "border border-gray-300 p-2 bg-secondary whitespace-nowrap",
    td: "border border-gray-300 p-2 break-words",
  },
  hr: "my-8 border-gray-200 dark:border-gray-700",
  image: "max-w-full rounded-lg my-4",
  link: "text-blue-600 underline hover:text-blue-800 dark:text-blue-400 break-all",
  math: {
    display: "my-4 overflow-x-auto",
    inline: "overflow-x-auto",
  },
  code: {
    block: "rounded-lg p-4 bg-secondary overflow-x-auto whitespace-pre",
    inline: "bg-secondary rounded px-1 whitespace-nowrap",
  },
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className,
  styles = {} 
}) => {
  const mergedStyles = {
    ...defaultStyles,
    ...styles,
    headings: { ...defaultStyles.headings, ...styles.headings },
    lists: { ...defaultStyles.lists, ...styles.lists },
    table: { ...defaultStyles.table, ...styles.table },
    math: { ...defaultStyles.math, ...styles.math },
    code: { ...defaultStyles.code, ...styles.code },
  };

  return (
    <div className={cn("w-full overflow-none markdown markdown-prose prose", className)}>
      <div className={cn(mergedStyles.container)}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[
            rehypeKatex,
            [rehypeHighlight, { ignoreMissing: true }],
          ]}
          components={{
            h1: ({ children }) => (
              <h1 className={mergedStyles.headings?.h1}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className={mergedStyles.headings?.h2}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className={mergedStyles.headings?.h3}>{children}</h3>
            ),
            ul: ({ children }) => (
              <ul className={mergedStyles.lists?.ul}>{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className={mergedStyles.lists?.ol}>{children}</ol>
            ),
            li: ({ children }) => (
              <li className={mergedStyles.lists?.li}>{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className={mergedStyles.blockquote}>{children}</blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className={mergedStyles.table?.container}>{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className={mergedStyles.table?.th}>{children}</th>
            ),
            td: ({ children }) => (
              <td className={mergedStyles.table?.td}>{children}</td>
            ),
            hr: () => <hr className={mergedStyles.hr} />,
            img: ({ src, alt }) => (
              <img src={src} alt={alt} className={mergedStyles.image} />
            ),
            a: ({ href, children }) => (
              <a href={href} className={mergedStyles.link}>{children}</a>
            ),
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="overflow-x-auto">
                  <pre className={mergedStyles.code?.block}>
                    <code className={`language-${match[1]}`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className={cn(mergedStyles.code?.inline, className)} {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => (
              <p className="break-words">{children}</p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownRenderer;