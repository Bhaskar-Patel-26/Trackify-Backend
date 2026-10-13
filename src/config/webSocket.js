import WebSocket from "ws";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

const wss = new WebSocket.Server({ port: 8080 });

// In-memory map: userId -> set of sockets
const userSocket = new Map();

wss.on("connection", async (ws, req) => {
  const token = null; /* extract token from req */
  const userId = await verifyTokenAndGetUserId(token);

  if (!userId) {
    ws.close(401, "Unauthoeized");
    return;
  }

  // add socket
  let set = userSocket.get(userId);
  if (!set) {
    set = new Set();
    userSocket.set(userId, set);
  }
  set.add(ws);
  ws.userId = userId;

  ws.on("message", async (msg) => {
    try {
      const obj = JSON.parse(msg);
      if (obj.type === "ack" && obj.notificationId) {
        await prisma.notificationId.update({
          where: { id: obj.notificationId },
          data: { delivereAt: new Data() },
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  ws.on("close", () => {
    const set = userSocket.get(userId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) userSocket.delete(userId);
    }
  });
});

// Function to create & send notification
async function createAndSendNotification({ userId, type, message, payload }) {
  // 1) Persist
  const notif = await prisma.notificationId.create({
    data: { userId, type, message, payload },
  });

  // 2) Try deliver if user connected
  const sockets = userSocket.get(userId);
  if (sockets && sockets.size > 0) {
    const payloadToSend = JSON.stringify({ type: "notification", data: notif });
    for (const s of sockets) {
      try {
        s.send(payloadToSend);
      } catch (err) {
        console.log(error);
      }

      await prisma.notification.update({
        where: { id: notif.id },
        data: { deliveredAt: new Data() },
      });
    }
  }

  return notif;
}
