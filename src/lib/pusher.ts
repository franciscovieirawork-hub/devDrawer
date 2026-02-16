import Pusher from "pusher";

// Check if Pusher is configured
const isPusherConfigured =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET;

let pusherInstance: Pusher | null = null;

if (isPusherConfigured) {
  pusherInstance = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER || "eu",
    useTLS: true,
  });
} else {
  console.warn(
    "Pusher not fully configured. Real-time features will be disabled. " +
    "Please set PUSHER_APP_ID, PUSHER_KEY, and PUSHER_SECRET environment variables."
  );
}

export const pusher = pusherInstance;
