"use client";

import { useCallback, useEffect, useRef } from "react";
import { Tldraw, Editor } from "tldraw";
import { useAppStore } from "@/store/app";
import "tldraw/tldraw.css";

interface WhiteboardProps {
  plannerId: string;
  initialContent: Record<string, unknown> | null;
}

const AUTOSAVE_DELAY = 2000;

export function Whiteboard({ plannerId, initialContent }: WhiteboardProps) {
  const editorRef = useRef<Editor | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const theme = useAppStore((s) => s.theme);

  // Sync theme with tldraw
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.user.updateUserPreferences({
        colorScheme: theme === "dark" ? "dark" : "light",
      });
    }
  }, [theme]);

  const save = useCallback(async () => {
    if (!editorRef.current) return;

    const snapshot = editorRef.current.store.getStoreSnapshot();
    const serialized = JSON.stringify(snapshot);

    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;

    try {
      await fetch(`/api/planner/${plannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: snapshot }),
      });
    } catch (err) {
      console.error("Autosave failed:", err);
    }
  }, [plannerId]);

  const handleChange = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(save, AUTOSAVE_DELAY);
  }, [save]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Set theme
      editor.user.updateUserPreferences({
        colorScheme: theme === "dark" ? "dark" : "light",
      });

      // Load saved content
      if (initialContent && typeof initialContent === "object" && "store" in initialContent) {
        try {
          editor.store.loadStoreSnapshot(
            initialContent as unknown as Parameters<typeof editor.store.loadStoreSnapshot>[0]
          );
        } catch (err) {
          console.error("Failed to load saved content:", err);
        }
      }

      // Listen for changes
      editor.store.listen(() => {
        handleChange();
      });
    },
    [initialContent, handleChange, theme]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      save();
    };
  }, [save]);

  return (
    <div className="absolute inset-0">
      <Tldraw
        onMount={handleMount}
        options={{ maxPages: 1 }}
        forceMobile={false}
        inferDarkMode={false}
      />
    </div>
  );
}
