import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPlannerWithAccess } from "@/lib/planner-access";
import { pusher } from "@/lib/pusher";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPlannerWithAccess(id, user);
  if (!result) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Pusher sends data as application/x-www-form-urlencoded
  const formData = await request.formData();
  const socket_id = formData.get("socket_id") as string;
  const channel_name = formData.get("channel_name") as string;

  if (!socket_id || !channel_name) {
    return NextResponse.json({ error: "Missing socket_id or channel_name." }, { status: 400 });
  }

  // Validate channel name format
  const privateChannelPattern = /^private-planner-/;
  const presenceChannelPattern = /^presence-planner-/;

  if (!privateChannelPattern.test(channel_name) && !presenceChannelPattern.test(channel_name)) {
    return NextResponse.json({ error: "Invalid channel name." }, { status: 400 });
  }

  // Ensure channel is for this planner
  const expectedPrefix = `planner-${id}`;
  if (!channel_name.includes(expectedPrefix)) {
    return NextResponse.json({ error: "Channel does not match planner." }, { status: 403 });
  }

  if (!pusher) {
    return NextResponse.json(
      { error: "Real-time features not configured." },
      { status: 503 }
    );
  }

  try {
    if (presenceChannelPattern.test(channel_name)) {
      // Presence channel: authenticate with user info
      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.username || user.email,
          email: user.email,
        },
      };
      const auth = pusher.authorizeChannel(socket_id, channel_name, presenceData);
      return NextResponse.json(auth);
    } else {
      // Private channel: simple authorization
      const auth = pusher.authorizeChannel(socket_id, channel_name);
      return NextResponse.json(auth);
    }
  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ error: "Authorization failed." }, { status: 500 });
  }
}
