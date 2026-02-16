"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tldraw, Editor } from "tldraw";
import { useAppStore } from "@/store/app";
import Pusher from "pusher-js";
import "tldraw/tldraw.css";

interface WhiteboardProps {
  plannerId: string;
  initialContent: Record<string, unknown> | null;
  readOnly?: boolean;
  currentUser?: {
    id: string;
    displayName: string;
  };
}

const AUTOSAVE_DELAY = 150; // Reduced for faster real-time updates
const CURSOR_UPDATE_INTERVAL = 50; // ms

interface RemoteCursor {
  x: number;
  y: number;
  userName: string;
}

// Cursor overlay component
function CursorOverlay({
  editor,
  cursors,
}: {
  editor: Editor | null;
  cursors: Record<string, RemoteCursor>;
}) {
  const [screenCursors, setScreenCursors] = useState<Record<string, { x: number; y: number; userName: string }>>({});

  useEffect(() => {
    if (!editor) return;

    const updateScreenPositions = () => {
      const newScreenCursors: Record<string, { x: number; y: number; userName: string }> = {};
      for (const [userId, cursor] of Object.entries(cursors)) {
        try {
          const screen = editor.pageToScreen({ x: cursor.x, y: cursor.y });
          newScreenCursors[userId] = {
            x: screen.x,
            y: screen.y,
            userName: cursor.userName,
          };
        } catch {
          // Skip if conversion fails
        }
      }
      setScreenCursors(newScreenCursors);
    };

    updateScreenPositions();

    // Listen to viewport changes
    const unsubscribe = editor.store.listen(() => {
      updateScreenPositions();
    }, { source: "user", scope: "document" });

    return unsubscribe;
  }, [editor, cursors]);

  if (!editor || Object.keys(screenCursors).length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {Object.entries(screenCursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute pointer-events-none"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex flex-col items-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <path
                d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                fill="currentColor"
                className="text-blue-500"
              />
            </svg>
            <div className="mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500 text-white shadow-lg whitespace-nowrap">
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Whiteboard({
  plannerId,
  initialContent,
  readOnly = false,
  currentUser,
}: WhiteboardProps) {
  const editorRef = useRef<Editor | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const cursorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const privateChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const [presenceMembers, setPresenceMembers] = useState<Record<string, { name: string }>>({});
  const theme = useAppStore((s) => s.theme);

  // Sync theme with tldraw
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.user.updateUserPreferences({
        colorScheme: theme === "dark" ? "dark" : "light",
      });
    }
  }, [theme]);

  // Ensure readonly state is maintained
  useEffect(() => {
    if (editorRef.current && readOnly) {
      editorRef.current.updateInstanceState({ isReadonly: true });
    }
  }, [readOnly, editor]);

  const save = useCallback(async () => {
    if (!editorRef.current) return;

    const snapshot = editorRef.current.store.getStoreSnapshot();
    const serialized = JSON.stringify(snapshot);

    if (serialized === lastSavedRef.current) {
      return;
    }
    
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

  // Set up Pusher real-time connection
  useEffect(() => {
    // Skip real-time if Pusher not configured
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      return;
    }

    // For read-only mode without user, we can still receive updates but can't send
    // For edit mode, we need a user for authentication
    if (!readOnly && !currentUser) {
      return;
    }

    // If no user but read-only, create a guest connection (read-only)
    const isGuest = !currentUser && readOnly;

    // For guests (read-only, no user), we'll use public channels
    // For authenticated users, we use private/presence channels
    const userId = currentUser?.id || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const pusherConfig: any = {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    };

    // Only use auth endpoint if we have a user (for private/presence channels)
    if (currentUser) {
      pusherConfig.authEndpoint = `/api/planner/${plannerId}/realtime-auth`;
      pusherConfig.auth = {
        headers: {
          // Cookies are sent automatically
        },
      };
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, pusherConfig);
    pusherRef.current = pusher;

    // Subscribe to presence channel (only if authenticated)
    if (currentUser) {
      const presenceChannel = pusher.subscribe(`presence-planner-${plannerId}`);
      presenceChannelRef.current = presenceChannel;

      presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
        const memberMap: Record<string, { name: string }> = {};
        members.each((member: any) => {
          if (member.id !== userId && member.info) {
            memberMap[member.id] = { name: member.info.name || member.info.email || "Unknown" };
          }
        });
        setPresenceMembers(memberMap);
      });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      if (member.id !== userId && member.info) {
        setPresenceMembers((prev) => ({
          ...prev,
          [member.id]: { name: member.info.name || member.info.email || "Unknown" },
        }));
      }
    });

      presenceChannel.bind("pusher:member_removed", (member: any) => {
        setPresenceMembers((prev) => {
          const next = { ...prev };
          delete next[member.id];
          return next;
        });
        setRemoteCursors((prev) => {
          const next = { ...prev };
          delete next[member.id];
          return next;
        });
      });
    }

    // Subscribe to channel for content updates
    // Use public channel for guests, private for authenticated users
    const channelName = currentUser 
      ? `private-planner-${plannerId}` 
      : `public-planner-${plannerId}`;
    
    const contentChannel = pusher.subscribe(channelName);
    privateChannelRef.current = contentChannel;

    // Bind content-update handler
    const contentUpdateHandler = (data: { content: any; userId: string; timestamp?: number }) => {
      // Only apply if not from current user
      if (data.userId === userId) {
        return;
      }

      if (!editorRef.current) {
        // Queue the update for when editor is ready
        setTimeout(() => {
          if (editorRef.current && data.content) {
            try {
              editorRef.current.store.loadStoreSnapshot(data.content);
              const remoteSerialized = JSON.stringify(data.content);
              lastSavedRef.current = remoteSerialized;
            } catch (err) {
              console.error("Failed to apply queued remote content update:", err);
            }
          }
        }, 100);
        return;
      }

      try {
        // Verify content format
        if (!data.content || typeof data.content !== "object" || !("store" in data.content)) {
          return;
        }

        // Apply remote update immediately
        editorRef.current.store.loadStoreSnapshot(data.content);
        
        // Update lastSaved to prevent autosave loop
        const remoteSerialized = JSON.stringify(data.content);
        lastSavedRef.current = remoteSerialized;
      } catch (err) {
        console.error("Failed to apply remote content update:", err);
      }
    };

    // Bind the handler
    contentChannel.bind("content-update", contentUpdateHandler);

    // Listen for cursor movements from other users (only if authenticated)
    if (currentUser) {
      contentChannel.bind("client-cursor-move", (data: { userId: string; x: number; y: number }) => {
      if (data.userId === userId) return;

        const userName = presenceMembers[data.userId]?.name || "Unknown";
        setRemoteCursors((prev) => ({
          ...prev,
          [data.userId]: { x: data.x, y: data.y, userName },
        }));
      });
    }

    return () => {
      pusher.disconnect();
    };
  }, [plannerId, currentUser?.id, readOnly]);

  // Track cursor position and broadcast it
  useEffect(() => {
    if (!editor || readOnly || !privateChannelRef.current || !currentUser) return;

    const userId = currentUser.id; // Store locally to avoid dependency issues

    const sendCursorPosition = (screenX: number, screenY: number) => {
      if (!editor || !privateChannelRef.current) return;

      try {
        const pagePoint = editor.screenToPage({ x: screenX, y: screenY });
        privateChannelRef.current.trigger("client-cursor-move", {
          userId,
          x: pagePoint.x,
          y: pagePoint.y,
        });
      } catch {
        // Ignore cursor errors
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
      cursorTimerRef.current = setTimeout(() => {
        const container = editor.getContainer();
        const rect = container.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        sendCursorPosition(screenX, screenY);
      }, CURSOR_UPDATE_INTERVAL);
    };

    const container = editor.getContainer();
    container.addEventListener("pointermove", handlePointerMove);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current);
    };
  }, [editor, readOnly, currentUser]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      setEditor(editor);

      // Set readonly mode FIRST, before loading content
      if (readOnly) {
        editor.updateInstanceState({ isReadonly: true });
      }

      // Set theme
      editor.user.updateUserPreferences({
        colorScheme: theme === "dark" ? "dark" : "light",
      });

      // Load saved content
      if (
        initialContent &&
        typeof initialContent === "object" &&
        "store" in initialContent
      ) {
        try {
          editor.store.loadStoreSnapshot(
            initialContent as unknown as Parameters<
              typeof editor.store.loadStoreSnapshot
            >[0]
          );
          // Ensure readonly is still set after loading content
          if (readOnly) {
            editor.updateInstanceState({ isReadonly: true });
          }
        } catch (err) {
          console.error("Failed to load saved content:", err);
        }
      }

      // Listen for changes (skip autosave when read-only)
      if (!readOnly) {
        editor.store.listen(() => {
          handleChange();
        });
      }
    },
    [initialContent, handleChange, theme, readOnly]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (!readOnly) save();
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [save, readOnly]);

  // Update remote cursors with presence member names
  useEffect(() => {
    setRemoteCursors((prev) => {
      const updated = { ...prev };
      for (const userId in updated) {
        if (presenceMembers[userId]) {
          updated[userId] = {
            ...updated[userId],
            userName: presenceMembers[userId].name,
          };
        }
      }
      return updated;
    });
  }, [presenceMembers]);

  return (
    <div className="absolute inset-0">
      <Tldraw
        onMount={handleMount}
        options={{ maxPages: 1 }}
        forceMobile={false}
        inferDarkMode={false}
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
      />
      <CursorOverlay editor={editor} cursors={remoteCursors} />
    </div>
  );
}
