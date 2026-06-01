"use client";

import { useState } from "react";
import { FileText, Trash2, Calendar, Hash, X, Check } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  chunkCount: number;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocumentIds: string[];
  onToggleDocument: (documentId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteDocument: (documentId: string) => void;
}

export default function DocumentList({
  documents,
  selectedDocumentIds,
  onToggleDocument,
  onSelectAll,
  onClearSelection,
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

  const allSelected =
    documents.length > 0 && selectedDocumentIds.length === documents.length;

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-silver-500/10 bg-black/40 p-12 text-center shadow-2xl backdrop-blur-xl animate-scale-in motion-reduce:animate-none motion-reduce:opacity-100">
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
    <div className="overflow-hidden rounded-2xl border border-silver-500/10 bg-black/40 shadow-2xl backdrop-blur-xl animate-fade-in motion-reduce:animate-none motion-reduce:opacity-100 [animation-delay:0.12s] motion-reduce:[animation-delay:0ms]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-silver-500/10 bg-gradient-to-r from-silver-500/5 to-transparent p-6">
        <h2 className="text-2xl font-bold text-white">
          Your Documents{" "}
          <span className="font-normal text-silver-400">({documents.length})</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {selectedDocumentIds.length > 0 && (
            <span className="text-sm text-silver-400/80">
              {selectedDocumentIds.length} selected for chat
            </span>
          )}
          <button
            type="button"
            onClick={() => (allSelected ? onClearSelection() : onSelectAll())}
            className="text-sm text-silver-400/70 hover:text-silver-300 px-3 py-1.5 rounded-lg hover:bg-silver-500/10 transition-all duration-300"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          {selectedDocumentIds.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sm text-silver-400/70 hover:text-silver-300 flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-silver-500/10 transition-all duration-300"
            >
              <X className="h-4 w-4" />
              <span>Clear selection</span>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-silver-500/10">
        {documents.map((doc, index) => {
          const isSelected = selectedDocumentIds.includes(doc.id);
          const staggerMs = Math.min(index, 14) * 42;
          return (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggleDocument(doc.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleDocument(doc.id);
                }
              }}
              style={{ animationDelay: `${staggerMs}ms` }}
              aria-selected={isSelected}
              className={`group relative cursor-pointer border-l-4 p-6 transition-colors duration-200 ease-out animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 ${
                isSelected
                  ? "border-l-silver-300 bg-silver-500/25 ring-1 ring-inset ring-silver-400/35 hover:bg-silver-500/35"
                  : "border-l-transparent hover:border-l-silver-500/50 hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <label
                    className="relative flex h-12 w-5 shrink-0 cursor-pointer items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleDocument(doc.id)}
                      className="peer sr-only"
                      aria-label={`Select ${doc.fileName}`}
                    />
                    <span
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-silver-400/60 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black ${
                        isSelected
                          ? "border-silver-200 bg-white shadow-md shadow-black/40"
                          : "border-silver-400/60 bg-zinc-900/80 shadow-inner shadow-black/40 group-hover:border-silver-300/70"
                      }`}
                    >
                      <Check
                        strokeWidth={3.5}
                        className={`h-3.5 w-3.5 text-black ${
                          isSelected ? "opacity-100" : "size-0 opacity-0"
                        }`}
                        aria-hidden
                      />
                    </span>
                  </label>
                  <div className="shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${
                        isSelected
                          ? "border border-silver-200/60 bg-gradient-to-br from-silver-200 via-silver-300 to-silver-500 shadow-md shadow-black/30"
                          : "border border-silver-500/35 bg-zinc-800/90 group-hover:border-silver-400/55 group-hover:bg-zinc-700/90"
                      }`}
                    >
                      <FileText
                        className={`h-6 w-6 ${
                          isSelected
                            ? "text-zinc-900"
                            : "text-silver-300 group-hover:text-silver-100"
                        }`}
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`mb-2 truncate text-lg font-semibold ${
                        isSelected ? "text-white" : "text-silver-100 group-hover:text-white"
                      }`}
                    >
                      {doc.fileName}
                    </h3>
                    <div
                      className={`flex flex-wrap items-center gap-4 text-sm ${
                        isSelected ? "text-silver-200/90" : "text-silver-400/70"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(doc.uploadDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4" />
                        <span>{doc.chunkCount} chunks</span>
                      </div>
                      <span
                        className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                          isSelected
                            ? "border-silver-400/45 bg-silver-500/30 text-silver-100"
                            : "border-silver-500/20 bg-silver-500/10"
                        }`}
                      >
                        {doc.fileType || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(doc.id, e)}
                  disabled={deletingId === doc.id}
                  className="ml-4 p-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-300 disabled:opacity-50 border border-transparent hover:border-red-500/20"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
