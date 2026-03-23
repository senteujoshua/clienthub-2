"use client";

import { useState, useEffect } from "react";
import { X, Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Document } from "@/types";

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (document.fileUrl.startsWith("data:")) {
      // Legacy base64 — available immediately
      setViewUrl(document.fileUrl);
      setLoading(false);
    } else {
      // Supabase Storage — fetch a signed URL
      fetch(`/api/documents/${document.id}/view-url`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setViewUrl(data.url);
        })
        .catch((err) => setError(err.message ?? "Failed to load document"))
        .finally(() => setLoading(false));
    }
  }, [document.id, document.fileUrl]);

  const isImage = document.mimeType.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";
  const isOffice =
    document.mimeType.includes("word") ||
    document.mimeType.includes("excel") ||
    document.mimeType.includes("spreadsheet") ||
    document.mimeType.includes("presentation");

  // Google Docs Viewer can't handle data: URLs
  const canPreviewOffice =
    isOffice && viewUrl && !viewUrl.startsWith("data:");

  function renderContent() {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C9C1B1] animate-spin" />
        </div>
      );
    }

    if (error || !viewUrl) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#C9C1B1]">
          <FileText className="w-12 h-12" />
          <p className="text-sm">{error ?? "Could not load preview"}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                `/api/documents/${document.id}/download`,
                "_blank"
              )
            }
          >
            <Download className="w-4 h-4" />
            Download instead
          </Button>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#1B2632]/5 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={viewUrl}
            alt={document.fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={viewUrl}
          className="flex-1 w-full border-0"
          title={document.fileName}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    if (canPreviewOffice) {
      const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
        viewUrl
      )}&embedded=true`;
      return (
        <iframe
          src={googleUrl}
          className="flex-1 w-full border-0"
          title={document.fileName}
        />
      );
    }

    // Fallback for DOCX/XLSX with data: URL or unsupported format
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#C9C1B1]">
        <FileText className="w-14 h-14" />
        <div className="text-center">
          <p className="text-sm font-medium text-[#2C3B4D]">
            Preview not available
          </p>
          <p className="text-xs mt-1">
            Download the file to view it in the appropriate application.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(`/api/documents/${document.id}/download`, "_blank")
          }
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    );
  }

  return (
    /* Full-screen modal overlay */
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-14 bg-[#1B2632] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-4 h-4 text-[#FFB162] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {document.fileName}
            </p>
            <p className="text-xs text-[#C9C1B1]">{document.documentType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#C9C1B1] hover:text-white"
            onClick={() =>
              window.open(`/api/documents/${document.id}/download`, "_blank")
            }
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          {viewUrl && !viewUrl.startsWith("data:") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#C9C1B1] hover:text-white"
              onClick={() => window.open(viewUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Open</span>
            </Button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#C9C1B1] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {renderContent()}
      </div>
    </div>
  );
}
