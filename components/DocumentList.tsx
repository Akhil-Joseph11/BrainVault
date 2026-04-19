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
        <h2 className="text-2xl font-bold bg-gradient-to-r from-silver-200 to-silver-400 bg-clip-text text-transparent">
          Your Documents <span className="text-silver-400/60 font-normal">({documents.length})</span>
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
              className={`group relative cursor-pointer p-6 transition-all duration-300 ease-out animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 hover:bg-silver-500/5 hover:translate-x-[2px] ${
                isSelected
                  ? "bg-gradient-to-r from-silver-500/10 to-transparent shadow-lg shadow-silver-500/10 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-[1] before:w-1 before:bg-gradient-to-b before:from-silver-200 before:to-silver-500"
                  : ""
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
                      className="flex h-[18px] w-[18px] items-center justify-center rounded-md border border-silver-500/35 bg-black/50 shadow-inner shadow-black/40 transition-all duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-silver-400/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black peer-checked:border-silver-300/80 peer-checked:bg-gradient-to-br peer-checked:from-silver-300 peer-checked:to-silver-600 peer-checked:shadow-md peer-checked:shadow-silver-500/20 peer-checked:[&>svg]:opacity-100"
                    >
                      <Check
                        strokeWidth={3}
                        className="h-3 w-3 text-black opacity-0 transition-opacity duration-150"
                        aria-hidden
                      />
                    </span>
                  </label>
                  <div className="flex-shrink-0">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-silver-400 to-silver-600 shadow-lg shadow-silver-500/30"
                          : "bg-silver-500/10 group-hover:bg-silver-500/20 border border-silver-500/20"
                      }`}
                    >
                      <FileText className={`h-6 w-6 ${isSelected ? "text-black" : "text-silver-400"}`} />
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
