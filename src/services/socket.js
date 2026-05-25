import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAccessToken } from "./tokenUtils";

let stompClient = null;

const WS_URL = import.meta.env.VITE_WS_URL?.trim();

if (!WS_URL) {
  throw new Error("VITE_WS_URL is required");
}

export const connectWebSocket = (
  token,
  onMessageReceived,
  onStatusChange = () => {}
) => {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    beforeConnect: () => {
      const freshToken = getAccessToken() || token;
      stompClient.connectHeaders = {
        Authorization: `Bearer ${freshToken}`,
      };
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,

    onConnect: () => {
      onStatusChange("connected");

      stompClient.subscribe("/user/queue/messages", (message) => {
        const received = JSON.parse(message.body);
        onMessageReceived(received);
      });
    },

    onStompError: (frame) => {
      onStatusChange("error");
      console.error("WebSocket error:", frame.headers?.message);
    },

    onWebSocketClose: () => {
      onStatusChange("disconnected");
    },
  });

  onStatusChange("connecting");
  stompClient.activate();
};

export const sendMessage = (payload) => {
  if (!stompClient || !stompClient.connected) {
    return false;
  }

  stompClient.publish({
    destination: "/app/chat.send",
    body: JSON.stringify(payload),
  });

  return true;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
