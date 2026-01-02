"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import FileUpload from "./FileUpload";
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

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeView, setActiveView] = useState<"documents" | "chat">("documents");

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocumentId && !documents.find((doc) => doc.id === selectedDocumentId)) {
      setSelectedDocumentId(null);
    }
  }, [documents, selectedDocumentId]);

  const handleUploadComplete = async (newDocumentId?: string) => {
    await fetchDocuments();
    setIsUploading(false);
    if (newDocumentId) {
      setTimeout(() => {
        setSelectedDocumentId(newDocumentId);
      }, 100);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents?documentId=${documentId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        if (selectedDocumentId === documentId) {
          setSelectedDocumentId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111] text-white">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-silver-500/5 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative bg-black/80 backdrop-blur-xl border-b border-silver-500/10 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <BrainVaultLogo size="md" showText={true} />
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-silver-500/10 rounded-lg border border-silver-500/20">
                <Sparkles className="h-4 w-4 text-silver-400" />
                <span className="text-sm text-silver-300 font-medium">AI Powered</span>
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
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex space-x-2 border-b border-silver-500/10">
          <button
            onClick={() => setActiveView("documents")}
            className={`group flex items-center space-x-2 px-6 py-3 border-b-2 transition-all duration-300 ${
              activeView === "documents"
                ? "border-silver-400 text-silver-100 bg-silver-500/5"
                : "border-transparent text-silver-500/60 hover:text-silver-300 hover:bg-silver-500/5"
            }`}
          >
            <Upload className={`h-4 w-4 transition-transform ${activeView === "documents" ? "scale-110" : "group-hover:scale-110"}`} />
            <span className="font-semibold tracking-wide">Documents</span>
          </button>
          <button
            onClick={() => setActiveView("chat")}
            className={`group flex items-center space-x-2 px-6 py-3 border-b-2 transition-all duration-300 ${
              activeView === "chat"
                ? "border-silver-400 text-silver-100 bg-silver-500/5"
                : "border-transparent text-silver-500/60 hover:text-silver-300 hover:bg-silver-500/5"
            }`}
          >
            <MessageSquare className={`h-4 w-4 transition-transform ${activeView === "chat" ? "scale-110" : "group-hover:scale-110"}`} />
            <span className="font-semibold tracking-wide">Chat</span>
          </button>
        </div>

        {/* Content Area */}
        {activeView === "documents" ? (
          <div className="space-y-6">
            <FileUpload
              onUploadStart={() => setIsUploading(true)}
              onUploadComplete={handleUploadComplete}
            />
            <DocumentList
              documents={documents}
              selectedDocumentId={selectedDocumentId}
              onSelectDocument={setSelectedDocumentId}
              onDeleteDocument={handleDeleteDocument}
            />
          </div>
        ) : (
          <ChatInterface
            selectedDocumentId={selectedDocumentId}
            documents={documents}
          />
        )}
      </main>
    </div>
  );
}

