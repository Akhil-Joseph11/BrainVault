"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, FileText, Loader2 } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
}

interface ChatInterfaceProps {
  selectedDocumentId: string | null;
  documents: Document[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    fileName: string;
    chunkIndex: number;
    score: number;
  }>;
}

export default function ChatInterface({ selectedDocumentId, documents }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const validSelectedDocumentId = selectedDocumentId && documents.find((d) => d.id === selectedDocumentId) 
    ? selectedDocumentId 
    : null;
  const selectedDoc = validSelectedDocumentId ? documents.find((d) => d.id === validSelectedDocumentId) : undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [validSelectedDocumentId]);

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
          documentId: validSelectedDocumentId, // Use validated documentId
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
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-silver-500/10 flex flex-col h-[calc(100vh-300px)] max-h-[800px] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-silver-500/10 bg-gradient-to-r from-silver-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-silver-200 to-silver-400 bg-clip-text text-transparent">
            Chat with Your Documents
          </h2>
          {selectedDoc && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-silver-500/10 border border-silver-500/20 rounded-lg backdrop-blur-sm">
              <FileText className="h-4 w-4 text-silver-400" />
              <span className="text-sm font-semibold text-silver-200">
                {selectedDoc.fileName}
              </span>
            </div>
          )}
        </div>
        {!selectedDoc && (
          <p className="mt-3 text-sm text-silver-400/70">
            Select a document from the Documents tab to chat with it, or ask general questions about all your documents.
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-silver-400/10 rounded-full blur-2xl"></div>
                <Bot className="h-16 w-16 text-silver-400 mx-auto relative" />
              </div>
              <p className="text-silver-300 text-lg font-medium">
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
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-silver-500/20">
                    <p className="text-xs font-semibold mb-3 text-silver-400/80 uppercase tracking-wider">Sources:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs text-silver-300/80 flex items-center space-x-2 bg-silver-500/5 px-3 py-2 rounded-lg border border-silver-500/10">
                          <FileText className="h-3.5 w-3.5 text-silver-400" />
                          <span className="flex-1">
                            {source.fileName} <span className="text-silver-400/60">(Chunk {source.chunkIndex})</span>
                            {source.score && (
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
            className="flex-1 resize-none border border-silver-500/20 rounded-xl px-5 py-3 bg-black/40 backdrop-blur-sm text-silver-100 placeholder-silver-500/50 focus:outline-none focus:ring-2 focus:ring-silver-400/50 focus:border-silver-400/50 transition-all duration-300"
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
            className="p-3 bg-gradient-to-br from-silver-400 to-silver-500 text-black rounded-xl hover:from-silver-300 hover:to-silver-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-silver-500/20 hover:shadow-silver-400/30 hover:scale-105 disabled:hover:scale-100 font-semibold"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

