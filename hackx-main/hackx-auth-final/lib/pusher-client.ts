import PusherClient from "pusher-js";

let pusher: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusher && typeof window !== "undefined") {
    pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      enabledTransports: ["ws", "wss"],
    });
  }
  return pusher!;
}

export function disconnectPusher() {
  if (pusher) {
    pusher.disconnect();
    pusher = null;
  }
}
