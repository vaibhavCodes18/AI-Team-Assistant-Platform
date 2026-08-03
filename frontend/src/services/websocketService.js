import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Dynamic socket URL resolution from environment variable or standard backend fallback
const getSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, "")}/ws`;
  }
  return "http://localhost:1818/ws";
};

export const createStompClient = (topic, onMessageReceived) => {
  const socketUrl = getSocketUrl();

  const stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),

    connectHeaders: {

        Authorization:
            `Bearer ${localStorage.getItem("accessToken")}`

    },

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ Connected to STOMP WebSocket broker at:", socketUrl);

      if (topic) {
        stompClient.subscribe(topic, (message) => {
          if (message.body) {
            try {
              const parsed = JSON.parse(message.body);
              onMessageReceived(parsed);
            } catch (err) {
              console.warn("Received text WebSocket message:", message.body);
              onMessageReceived({ content: message.body });
            }
          }
        });
      }
    },

    onStompError: (frame) => {
      console.error("STOMP Broker Error:", frame.headers["message"]);
      console.error(frame.body);
    },

    onWebSocketError: (error) => {
      console.error("WebSocket Error:", error);
    },
  });

  return stompClient;
};
