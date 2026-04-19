"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";
import ChatMessageMarkdown from "./ChatMessageMarkdown";

interface Document {
  id: string;
  fileName: string;
}

interface ChatInterfaceProps {
  selectedDocumentIds: string[];
  documents: Document[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    documentId?: string;
    fileName: string;
    chunkIndex: number;
    score: number;
  }>;
}

/** Max document pills on one row before "+N"; keeps header height stable. */
const MAX_VISIBLE_DOC_CHIPS = 4;

export default function ChatInterface({ selectedDocumentIds, documents }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const docById = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);

  const validSelectedIds = useMemo(
    () => selectedDocumentIds.filter((id) => docById.has(id)),
    [selectedDocumentIds, docById]
  );

  const selectionKey = [...validSelectedIds].sort().join("\0");

  const selectedDocs = validSelectedIds.map((id) => docById.get(id)!);

  const visibleDocs = selectedDocs.slice(0, MAX_VISIBLE_DOC_CHIPS);
  const overflowCount = Math.max(0, selectedDocs.length - visibleDocs.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [selectionKey]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          documentIds: validSelectedIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantMessageAdded = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.content) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (assistantMessageAdded && updated[updated.length - 1]?.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: (updated[updated.length - 1].content || "") + data.content,
                      };
                    } else {
                      assistantMessageAdded = true;
                      updated.push({
                        role: "assistant",
                        content: data.content,
                      });
                    }
                    return updated;
                  });
                }

                if (data.sources) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]?.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        sources: data.sources,
                      };
                    }
                    return updated;
                  });
                  setIsLoading(false);
                }

                if (data.done) {
                  setIsLoading(false);
                }

                if (data.error) {
                  setIsLoading(false);
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: data.error || "An error occurred",
                    },
                  ]);
                }
              } catch (e) {
                // Skip invalid JSON
                console.error("Error parsing SSE data:", e);
              }
            }
          }
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-300px)] max-h-[800px] flex-col overflow-hidden rounded-2xl border border-silver-500/10 bg-black/40 shadow-2xl shadow-black/40 backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_0_48px_-20px_rgba(192,192,192,0.06)] animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 [animation-delay:60ms] motion-reduce:[animation-delay:0ms]">
      {/* Header — compact single band */}
      <div className="shrink-0 border-b border-silver-500/10 bg-gradient-to-r from-silver-500/5 to-transparent px-4 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:gap-x-6">
          <h2 className="bg-gradient-to-r from-silver-200 to-silver-400 bg-clip-text text-xl font-bold leading-tight text-transparent sm:text-2xl">
            Chat with Your Documents
          </h2>

          {selectedDocs.length > 0 && (
            <div className="flex min-w-0 w-full flex-nowrap items-center justify-start gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin] sm:justify-end">
              {visibleDocs.map((d, i) => (
                <div
                  key={d.id}
                  title={d.fileName}
                  style={{ animationDelay: `${i * 55}ms` }}
                  className="flex min-w-0 max-w-[min(13rem,calc(100vw-5rem))] shrink-0 animate-scale-in items-center gap-1.5 rounded-lg border border-silver-500/25 bg-black/40 px-2.5 py-1.5 shadow-sm shadow-black/30 backdrop-blur-sm transition-all duration-300 hover:border-silver-400/35 hover:shadow-[0_0_20px_-8px_rgba(192,192,192,0.2)] motion-reduce:animate-none motion-reduce:opacity-100 sm:max-w-[14rem]"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-silver-400" />
                  <span className="min-w-0 truncate text-xs font-medium text-silver-200">{d.fileName}</span>
                </div>
              ))}
              {overflowCount > 0 && (
                <div
                  className="flex shrink-0 animate-scale-in items-center rounded-lg border border-silver-500/30 bg-silver-500/10 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-silver-300 motion-reduce:animate-none motion-reduce:opacity-100"
                  style={{ animationDelay: `${visibleDocs.length * 55}ms` }}
                  title={`${overflowCount} more not shown`}
                >
                  +{overflowCount}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-2 text-xs sm:text-sm text-silver-400/70 leading-snug">
          {selectedDocs.length === 0
            ? "No documents selected — questions use all uploaded documents. Pick files on the Documents tab to narrow scope."
            : selectedDocs.length === 1
              ? "Scoped to the selected document."
              : `Scoped to ${selectedDocs.length} selected documents.`}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="relative mb-6 inline-flex animate-micro-float motion-reduce:animate-none">
                <div className="absolute inset-0 rounded-full bg-silver-400/10 blur-2xl motion-reduce:animate-none" />
                <Bot className="relative mx-auto h-16 w-16 text-silver-400 drop-shadow-[0_0_24px_rgba(192,192,192,0.15)]" />
              </div>
              <p className="text-lg font-medium text-silver-300">
                Start a conversation by asking a question about your documents
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full flex items-center justify-center shadow-lg shadow-silver-500/20">
                    <Bot className="h-5 w-5 text-black" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 backdrop-blur-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-silver-400 to-silver-500 text-black shadow-lg shadow-silver-500/30"
                    : "bg-silver-500/10 border border-silver-500/20 text-silver-100"
                }`}
              >
                <ChatMessageMarkdown
                  content={message.content}
                  variant={message.role === "user" ? "user" : "assistant"}
                />
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-silver-500/20">
                    <p className="text-xs font-semibold mb-3 text-silver-400/80 uppercase tracking-wider">Sources:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-silver-300/80 flex items-center space-x-2 bg-silver-500/5 px-3 py-2 rounded-lg border border-silver-500/10">
                          <FileText className="h-3.5 w-3.5 text-silver-400" />
                          <span className="flex-1">
                            {source.fileName} <span className="text-silver-400/60">(Chunk {source.chunkIndex})</span>
                            {source.score != null && (
                              <span className="ml-2 text-silver-400 font-semibold">• {(source.score * 100).toFixed(1)}% match</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-silver-500/20 border border-silver-500/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <User className="h-5 w-5 text-silver-300" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full flex items-center justify-center shadow-lg shadow-silver-500/20">
                <Bot className="h-5 w-5 text-black" />
              </div>
            </div>
            <div className="bg-silver-500/10 border border-silver-500/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <Loader2 className="h-5 w-5 animate-spin text-silver-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-silver-500/10 bg-gradient-to-r from-silver-500/5 to-transparent">
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            className="flex-1 resize-none rounded-xl border border-silver-500/20 bg-black/40 px-5 py-3 text-silver-100 backdrop-blur-sm placeholder-silver-500/50 transition-all duration-500 focus:border-silver-400/50 focus:outline-none focus:ring-2 focus:ring-silver-400/40"
            rows={1}
            disabled={isLoading}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-gradient-to-br from-silver-400 to-silver-500 p-3 font-semibold text-black shadow-lg shadow-silver-500/20 transition-all duration-300 hover:scale-105 hover:from-silver-300 hover:to-silver-400 hover:shadow-silver-400/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 motion-reduce:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
