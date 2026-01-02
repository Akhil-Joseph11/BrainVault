"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadStart: () => void;
  onUploadComplete: (documentId?: string) => void;
}

export default function FileUpload({ onUploadStart, onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt");

    if (!isPDF && !isText) {
      setUploadStatus("error");
      setUploadMessage("Please upload a PDF or text file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadMessage("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setUploadStatus("uploading");
    setUploadMessage(`Uploading ${file.name}...`);
    onUploadStart();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("success");
        setUploadMessage(`Successfully uploaded ${file.name} (${data.document.chunkCount} chunks)`);
        const newDocumentId = data.document.id;
        setTimeout(() => {
          setUploadStatus("idle");
          setUploadMessage("");
          setSelectedFile(null);
          onUploadComplete(newDocumentId);
        }, 3000);
      } else {
        setUploadStatus("error");
        setUploadMessage(data.error || "Upload failed");
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage("Failed to upload file. Please try again.");
      console.error("Upload error:", error);
    }
  }, [onUploadStart, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-silver-500/10 p-8 hover:border-silver-500/20 transition-all duration-300">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-silver-200 to-silver-400 bg-clip-text text-transparent mb-6 flex items-center space-x-2">
        <Upload className="h-6 w-6 text-silver-400" />
        <span>Upload Document</span>
      </h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? "border-silver-400 bg-silver-500/10 shadow-lg shadow-silver-500/20 scale-[1.02]"
            : "border-silver-500/20 hover:border-silver-500/40 hover:bg-silver-500/5"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileInput}
          disabled={uploadStatus === "uploading"}
        />

        {uploadStatus === "uploading" ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 text-silver-400 animate-spin" />
            <p className="text-silver-300 font-medium">{uploadMessage}</p>
          </div>
        ) : uploadStatus === "success" ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-silver-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <CheckCircle2 className="h-16 w-16 text-silver-400 relative" />
            </div>
            <p className="text-silver-300 font-semibold text-lg">{uploadMessage}</p>
          </div>
        ) : uploadStatus === "error" ? (
          <div className="flex flex-col items-center space-y-4">
            <X className="h-16 w-16 text-red-400" />
            <p className="text-red-400 font-medium">{uploadMessage}</p>
            <button
              onClick={() => {
                setUploadStatus("idle");
                setUploadMessage("");
                setSelectedFile(null);
              }}
              className="mt-2 px-6 py-2 bg-silver-500/10 border border-silver-500/30 text-silver-300 rounded-lg hover:bg-silver-500/20 hover:border-silver-500/50 transition-all duration-300 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-silver-400/10 rounded-full blur-2xl"></div>
              <Upload className="h-16 w-16 text-silver-400 mx-auto relative" />
            </div>
            <p className="text-xl font-semibold text-silver-200 mb-2">
              Drag and drop your document here
            </p>
            <p className="text-sm text-silver-400/70 mb-6">
              or click to browse
            </p>
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-silver-500 to-silver-400 text-black rounded-lg hover:from-silver-400 hover:to-silver-300 cursor-pointer transition-all duration-300 font-semibold shadow-lg shadow-silver-500/20 hover:shadow-silver-400/30 hover:scale-105"
            >
              <FileText className="h-5 w-5 mr-2" />
              Select File
            </label>
            <p className="text-xs text-silver-500/60 mt-6">
              Supported formats: PDF, TXT (Max 10MB)
            </p>
          </>
        )}
      </div>

      {selectedFile && uploadStatus !== "success" && uploadStatus !== "uploading" && (
        <div className="mt-6 p-4 bg-silver-500/5 border border-silver-500/20 rounded-lg flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-silver-400" />
            <span className="text-sm text-silver-200 font-medium">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              setUploadStatus("idle");
              setUploadMessage("");
            }}
            className="text-silver-500 hover:text-silver-300 transition-colors p-1 hover:bg-silver-500/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

