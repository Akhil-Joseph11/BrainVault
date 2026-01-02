"use client";

import { useState } from "react";
import { FileText, Trash2, Calendar, Hash, X } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  chunkCount: number;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string | null) => void;
  onDeleteDocument: (documentId: string) => void;
}

export default function DocumentList({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onDeleteDocument,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (documentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(documentId);
    try {
      await onDeleteDocument(documentId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (documents.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-silver-500/10 p-12 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-silver-400/5 rounded-full blur-2xl"></div>
          <FileText className="h-16 w-16 text-silver-400/50 mx-auto relative" />
        </div>
        <p className="text-silver-400/70 text-lg">
          No documents uploaded yet. Upload your first document to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-silver-500/10 overflow-hidden">
      <div className="p-6 border-b border-silver-500/10 bg-gradient-to-r from-silver-500/5 to-transparent flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-silver-200 to-silver-400 bg-clip-text text-transparent">
          Your Documents <span className="text-silver-400/60 font-normal">({documents.length})</span>
        </h2>
        {selectedDocumentId && (
          <button
            onClick={() => onSelectDocument(null)}
            className="text-sm text-silver-400/70 hover:text-silver-300 flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-silver-500/10 transition-all duration-300"
          >
            <X className="h-4 w-4" />
            <span>Clear selection</span>
          </button>
        )}
      </div>

      <div className="divide-y divide-silver-500/10">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(selectedDocumentId === doc.id ? null : doc.id)}
            className={`p-6 hover:bg-silver-500/5 cursor-pointer transition-all duration-300 group ${
              selectedDocumentId === doc.id
                ? "bg-gradient-to-r from-silver-500/10 to-transparent border-l-4 border-silver-400 shadow-lg shadow-silver-500/10"
                : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-1">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    selectedDocumentId === doc.id
                      ? "bg-gradient-to-br from-silver-400 to-silver-600 shadow-lg shadow-silver-500/30"
                      : "bg-silver-500/10 group-hover:bg-silver-500/20 border border-silver-500/20"
                  }`}>
                    <FileText className={`h-6 w-6 ${selectedDocumentId === doc.id ? "text-black" : "text-silver-400"}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-silver-100 truncate mb-2">
                    {doc.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-silver-400/70">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(doc.uploadDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span>{doc.chunkCount} chunks</span>
                    </div>
                    <span className="px-3 py-1 bg-silver-500/10 border border-silver-500/20 rounded-lg text-xs font-medium">
                      {doc.fileType || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(doc.id, e)}
                disabled={deletingId === doc.id}
                className="ml-4 p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300 disabled:opacity-50 border border-transparent hover:border-red-500/20"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

