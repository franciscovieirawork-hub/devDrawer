"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Pusher from "pusher-js";

interface PresenceMember {
  id: string;
  name: string;
  email?: string;
}

interface PresenceContextType {
  members: PresenceMember[];
  isConnected: boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  members: [],
  isConnected: false,
});

export function PresenceProvider({
  children,
  plannerId,
  currentUser,
  enabled = true,
}: {
  children: ReactNode;
  plannerId: string;
  currentUser?: { id: string; displayName: string };
  enabled?: boolean;
}) {
  const [members, setMembers] = useState<PresenceMember[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !currentUser || !process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: `/api/planner/${plannerId}/realtime-auth`,
      auth: {
        headers: {},
      },
    });

    const presenceChannel = pusher.subscribe(`presence-planner-${plannerId}`);

    presenceChannel.bind("pusher:subscription_succeeded", (membersData: any) => {
      const memberList: PresenceMember[] = [];
      membersData.each((member: any) => {
        if (member.info) {
          memberList.push({
            id: member.id,
            name: member.info.name || member.info.email || "Unknown",
            email: member.info.email,
          });
        }
      });
      setMembers(memberList);
      setIsConnected(true);
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      if (member.info) {
        setMembers((prev) => {
          if (prev.some((m) => m.id === member.id)) return prev;
          return [
            ...prev,
            {
              id: member.id,
              name: member.info.name || member.info.email || "Unknown",
              email: member.info.email,
            },
          ];
        });
      }
    });

    presenceChannel.bind("pusher:member_removed", (member: any) => {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    });

    return () => {
      pusher.disconnect();
      setIsConnected(false);
      setMembers([]);
    };
  }, [plannerId, currentUser?.id, enabled]);

  return (
    <PresenceContext.Provider value={{ members, isConnected }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  return useContext(PresenceContext);
}
