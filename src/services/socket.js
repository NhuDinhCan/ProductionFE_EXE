// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";

// let stompClient = null;

// export const connectWebSocket = (token, onMessageReceived, onStatusChange = () => {}) => {
//   if (stompClient && stompClient.active) {
//     stompClient.deactivate();
//   }

//   stompClient = new Client({
//     webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || "http://localhost:8080/ws"),
//     connectHeaders: {
//       Authorization: `Bearer ${token}`,
//     },
//     reconnectDelay: 5000,
//     heartbeatIncoming: 10000,
//     heartbeatOutgoing: 10000,

//     onConnect: () => {
//       onStatusChange("connected");
//       stompClient.subscribe("/user/queue/messages", (message) => {
//         const received = JSON.parse(message.body);
//         onMessageReceived(received);
//       });
//     },

//     onStompError: (frame) => {
//       onStatusChange("error");
//       console.error("WebSocket error:", frame.headers?.message);
//     },

//     onWebSocketClose: () => {
//       onStatusChange("disconnected");
//     },
//   });

//   onStatusChange("connecting");
//   stompClient.activate();
// };

// export const sendMessage = (payload) => {
//   if (!stompClient || !stompClient.connected) {
//     return false;
//   }

//   stompClient.publish({
//     destination: "/app/chat.send",
//     body: JSON.stringify(payload),
//   });
//   return true;
// };

// export const disconnectWebSocket = () => {
//   if (stompClient) {
//     stompClient.deactivate();
//     stompClient = null;
//   }
// };
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

const WS_URL = import.meta.env.VITE_WS_URL;

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