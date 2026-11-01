"use client";

import { useCallback, useEffect, useRef } from "react";
import { discardUploads } from "@/lib/admin-api";

// Tracks files uploaded during this form session. Anything not saved is deleted from ImageKit when the form closes.
export function useUploadSession() {
  const unsaved = useRef(new Set<string>());

  const discard = useCallback((keepalive = false) => {
    const fileIds = [...unsaved.current];
    unsaved.current.clear();
    void discardUploads(fileIds, keepalive);
  }, []);

  useEffect(() => {
    const onPageHide = () => discard(true);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      discard();
    };
  }, [discard]);

  return {
    track: (fileId: string) => unsaved.current.add(fileId),
    release: (fileId: string) => {
      const wasUnsaved = unsaved.current.delete(fileId);
      if (wasUnsaved) void discardUploads([fileId]);
    },
    markSaved: () => unsaved.current.clear(),
  };
}

export type UploadSession = ReturnType<typeof useUploadSession>;
