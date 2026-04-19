"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type Variant = "user" | "assistant";

interface ChatMessageMarkdownProps {
  content: string;
  variant: Variant;
}

export default function ChatMessageMarkdown({ content, variant }: ChatMessageMarkdownProps) {
  const user = variant === "user";

  const components: Components = {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    h1: ({ children }) => (
      <h1 className="mb-2 mt-3 text-xl font-bold first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2 mt-3 text-lg font-bold first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1 mt-2 text-base font-semibold first:mt-0">{children}</h3>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={
          user
            ? "font-medium text-black underline underline-offset-2 hover:text-neutral-800"
            : "font-medium text-silver-300 underline underline-offset-2 hover:text-silver-200"
        }
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={
          user
            ? "my-2 border-l-2 border-black/30 pl-3 italic text-black/90"
            : "my-2 border-l-2 border-silver-500/50 pl-3 italic text-silver-300/90"
        }
      >
        {children}
      </blockquote>
    ),
    del: ({ children }) => (
      <del className={user ? "line-through opacity-80" : "line-through opacity-75 text-silver-400"}>{children}</del>
    ),
    hr: () => <hr className={user ? "my-3 border-black/20" : "my-3 border-silver-500/30"} />,
    table: ({ children }) => (
      <div className="my-2 max-w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className={user ? "bg-black/10" : "bg-silver-500/10"}>{children}</thead>,
    th: ({ children }) => (
      <th
        className={
          user
            ? "border border-black/20 px-2 py-1 font-semibold"
            : "border border-silver-500/30 px-2 py-1 font-semibold"
        }
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={user ? "border border-black/20 px-2 py-1" : "border border-silver-500/30 px-2 py-1"}>
        {children}
      </td>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    code: (props) => {
      const { className, children, ...rest } = props as ComponentPropsWithoutRef<"code"> & {
        inline?: boolean;
      };
      const inline = (props as { inline?: boolean }).inline;
      if (inline === true) {
        return (
          <code
            className={
              user
                ? "rounded px-1.5 py-0.5 font-mono text-sm bg-black/10"
                : "rounded px-1.5 py-0.5 font-mono text-sm text-silver-100 bg-black/40"
            }
            {...rest}
          >
            {children}
          </code>
        );
      }
      return (
        <pre
          className={
            user
              ? "my-2 overflow-x-auto rounded-lg bg-black/10 p-3 text-sm"
              : "my-2 overflow-x-auto rounded-lg bg-black/50 p-3 text-sm"
          }
        >
          <code className={className} {...rest}>
            {children}
          </code>
        </pre>
      );
    },
  };

  return (
    <div className="leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
