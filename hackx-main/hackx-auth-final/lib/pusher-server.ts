import PusherServer from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_APP_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (!appId || !key || !secret || !cluster) {
  console.error("[Pusher] Missing environment variables:", {
    hasAppId: !!appId,
    hasKey: !!key,
    hasSecret: !!secret,
    hasCluster: !!cluster,
  });
}

export const pusher = new PusherServer({
  appId: appId!,
  key: key!,
  secret: secret!,
  cluster: cluster!,
  useTLS: true,
});

console.log(`[Pusher Server] Initialized with app ID: ${appId}, cluster: ${cluster}`);
