"use client";

import { useState, useEffect, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import FileUpload, { type UploadedDocumentPayload } from "./FileUpload";
import DocumentList from "./DocumentList";
import ChatInterface from "./ChatInterface";
import BrainVaultLogo from "./BrainVaultLogo";
import { FileText, MessageSquare, Upload, Sparkles } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  chunkCount: number;
}

/** Union by id: GET /api/documents uses a Pinecone ANN query that may omit some docs; keep any id only in client state. */
function mergeDocumentLists(prev: Document[], fetched: Document[]): Document[] {
  const map = new Map<string, Document>();
  for (const d of fetched) {
    map.set(d.id, d);
  }
  for (const d of prev) {
    if (!map.has(d.id)) {
      map.set(d.id, d);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"documents" | "chat">("documents");

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments((prev) => mergeDocumentLists(prev, data.documents));
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const valid = new Set(documents.map((d) => d.id));
    setSelectedDocumentIds((prev) => prev.filter((id) => valid.has(id)));
  }, [documents]);

  const toggleDocumentSelection = useCallback((documentId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId]
    );
  }, []);

  const selectAllDocuments = useCallback(() => {
    setSelectedDocumentIds(documents.map((d) => d.id));
  }, [documents]);

  const clearDocumentSelection = useCallback(() => {
    setSelectedDocumentIds([]);
  }, []);

  const handleUploadSuccess = (doc: UploadedDocumentPayload) => {
    const next: Document = {
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      uploadDate: doc.uploadDate,
      chunkCount: doc.chunkCount,
    };
    setDocuments((prev) => mergeDocumentLists(prev, [next]));
    void fetchDocuments();
    setTimeout(() => {
      setSelectedDocumentIds((prev) => [...new Set([...prev, doc.id])]);
    }, 100);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents?documentId=${documentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        setSelectedDocumentIds((prev) => prev.filter((id) => id !== documentId));
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111] text-white">
      {/* Ambient orbs */}
      <div
        className="pointer-events-none fixed -right-24 -top-28 z-0 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-silver-500/20 via-silver-600/5 to-transparent blur-3xl animate-float-slow motion-reduce:animate-none"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-36 -left-28 z-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-tr from-silver-600/15 via-transparent to-transparent blur-3xl animate-float-slower motion-reduce:animate-none"
        aria-hidden
      />
      {/* Base wash */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-silver-500/5 via-transparent to-transparent" />

      {/* Header */}
      <header className="relative z-20 bg-black/80 backdrop-blur-xl border-b border-silver-500/10 shadow-2xl shadow-black/50 animate-fade-in motion-reduce:animate-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <BrainVaultLogo size="md" showText={true} />
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 rounded-lg border border-silver-500/20 bg-silver-500/10 px-4 py-2 shadow-[0_0_24px_-8px_rgba(192,192,192,0.15)] transition-shadow duration-500 hover:border-silver-500/35">
                <Sparkles className="h-4 w-4 animate-pulse-soft text-silver-300 motion-reduce:animate-none" />
                <span className="text-sm font-medium text-silver-300">AI Powered</span>
              </div>
              <UserButton 
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10 border-2 border-silver-500/30",
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up motion-reduce:animate-none [animation-delay:80ms] motion-reduce:opacity-100">
        {/* Navigation Tabs */}
        <div className="mb-8 flex space-x-2 border-b border-silver-500/10">
          <button
            type="button"
            onClick={() => setActiveView("documents")}
            className={`group relative flex items-center space-x-2 overflow-hidden rounded-t-lg px-6 py-3 border-b-2 transition-all duration-500 ease-out ${
              activeView === "documents"
                ? "border-silver-400 text-silver-100 bg-silver-500/5 shadow-[0_-12px_32px_-12px_rgba(192,192,192,0.12)]"
                : "border-transparent text-silver-500/60 hover:text-silver-300 hover:bg-silver-500/5"
            }`}
          >
            <Upload
              className={`h-4 w-4 transition-transform duration-300 ease-out ${
                activeView === "documents" ? "scale-110 text-silver-200" : "group-hover:scale-110"
              }`}
            />
            <span className="font-semibold tracking-wide">Documents</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("chat")}
            className={`group relative flex items-center space-x-2 overflow-hidden rounded-t-lg px-6 py-3 border-b-2 transition-all duration-500 ease-out ${
              activeView === "chat"
                ? "border-silver-400 text-silver-100 bg-silver-500/5 shadow-[0_-12px_32px_-12px_rgba(192,192,192,0.12)]"
                : "border-transparent text-silver-500/60 hover:text-silver-300 hover:bg-silver-500/5"
            }`}
          >
            <MessageSquare
              className={`h-4 w-4 transition-transform duration-300 ease-out ${
                activeView === "chat" ? "scale-110 text-silver-200" : "group-hover:scale-110"
              }`}
            />
            <span className="font-semibold tracking-wide">Chat</span>
          </button>
        </div>

        {/* Content Area */}
        {activeView === "documents" ? (
          <div className="space-y-6">
            <FileUpload
              onUploadStart={() => {}}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={() => {}}
            />
            <DocumentList
              documents={documents}
              selectedDocumentIds={selectedDocumentIds}
              onToggleDocument={toggleDocumentSelection}
              onSelectAll={selectAllDocuments}
              onClearSelection={clearDocumentSelection}
              onDeleteDocument={handleDeleteDocument}
            />
          </div>
        ) : (
          <ChatInterface
            selectedDocumentIds={selectedDocumentIds}
            documents={documents}
          />
        )}
      </main>
    </div>
  );
}
