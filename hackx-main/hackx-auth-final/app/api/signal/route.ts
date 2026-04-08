/**
 * WebRTC Signaling Server
 *
 * Key behaviours
 * ──────────────
 * 1. Uses globalThis to persist state across Next.js HMR reloads in dev.
 * 2. Buffers the last `call-invite` and `offer` per room so a patient who
 *    joins AFTER the doctor has already sent those messages still receives
 *    them immediately on connect (replayed as "buffered-*" events).
 * 3. Echoes the resolved clientId back in the "connected" event so clients
 *    can detect their own messages and ignore them.
 *
 * GET  /api/signal?room=xxx&role=xxx&clientId=xxx  — SSE stream
 * POST /api/signal                                  — send signal
 */

type SignalClient = {
  controller: ReadableStreamDefaultController;
  role: string;
  clientId: string;
};

type RoomState = {
  clients: SignalClient[];
  // Last call-invite and offer buffered so late-joining patients get them
  bufferedInvite: { type: string; data: unknown; fromClientId: string } | null;
  bufferedOffer:  { type: string; data: unknown; fromClientId: string } | null;
};

declare global {
  var __signalRooms: Map<string, RoomState> | undefined;
}
if (!globalThis.__signalRooms) {
  globalThis.__signalRooms = new Map<string, RoomState>();
}
const rooms = globalThis.__signalRooms;

function getRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: [], bufferedInvite: null, bufferedOffer: null });
  }
  return rooms.get(roomId)!;
}

function send(controller: ReadableStreamDefaultController, payload: object) {
  try {
    controller.enqueue(
      new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`)
    );
  } catch {}
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room");
  const role = searchParams.get("role") || "unknown";
  const clientId =
    searchParams.get("clientId") ||
    Math.random().toString(36).slice(2) + Date.now().toString(36);

  if (!roomId) return new Response("Missing room", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const room = getRoom(roomId);
      const client: SignalClient = { controller, role, clientId };
      room.clients.push(client);

      // 1. Confirm connection with resolved clientId
      send(controller, { type: "connected", role, clientId });

      // 2. Replay buffered call-invite and offer to late-joining patients
      //    so they don't miss signals sent before their SSE connected.
      if (role === "patient") {
        if (room.bufferedInvite) {
          send(controller, { ...room.bufferedInvite, type: "call-invite" });
        }
        if (room.bufferedOffer) {
          send(controller, { ...room.bufferedOffer, type: "offer" });
        }
      }

      const hb = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(": heartbeat\n\n")); }
        catch { clearInterval(hb); }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(hb);
        const r = getRoom(roomId);
        const idx = r.clients.findIndex((c) => c.clientId === clientId);
        if (idx !== -1) r.clients.splice(idx, 1);
        // Clean up room entirely only when both sides have left AND no buffer
        if (r.clients.length === 0) rooms.delete(roomId);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { roomId, fromClientId, type, data } = body;

  if (!roomId || !type)
    return new Response("Missing roomId or type", { status: 400 });

  const room = getRoom(roomId);

  // Buffer call-invite and offer so late-joining patients receive them on connect
  if (type === "call-invite") {
    room.bufferedInvite = { type, data, fromClientId };
  }
  if (type === "offer") {
    room.bufferedOffer = { type, data, fromClientId };
  }
  // Clear buffer when call ends so a fresh call in the same room starts clean
  if (type === "end-call" || type === "call-rejected") {
    room.bufferedInvite = null;
    room.bufferedOffer  = null;
  }

  const msg = `data: ${JSON.stringify({ type, data, fromClientId })}\n\n`;
  const encoded = new TextEncoder().encode(msg);

  let sent = 0;
  for (const client of room.clients) {
    if (client.clientId !== fromClientId) {
      try { client.controller.enqueue(encoded); sent++; }
      catch {}
    }
  }

  return new Response(JSON.stringify({ ok: true, recipients: sent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
