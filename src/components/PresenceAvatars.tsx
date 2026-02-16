"use client";

import { usePresence } from "@/hooks/usePresence";

export function PresenceAvatars() {
  const { members, isConnected } = usePresence();

  if (!isConnected || members.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2">
      <div className="h-6 w-px bg-[var(--border)]" />
      <div className="flex items-center gap-1.5">
        {members.slice(0, 5).map((member) => {
          const initials = member.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          
          const color = `hsl(${member.id.charCodeAt(0) * 137.508 % 360}, 70%, 50%)`;

          return (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white border-2 border-[var(--card)] shadow-sm"
              style={{ backgroundColor: color }}
              title={member.name}
            >
              {initials}
            </div>
          );
        })}
        {members.length > 5 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-[var(--muted-foreground)] bg-[var(--muted)] border-2 border-[var(--card)]">
            +{members.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
