import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// Dynamic socket URL resolution from environment variable or standard backend fallback
const getSocketUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    envUrl = "http://localhost:8080";
  }

  // If client is on HTTPS, upgrade http:// backend URL to https:// to prevent Mixed Content security blocks
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    if (envUrl.startsWith("http://")) {
      envUrl = envUrl.replace("http://", "https://");
    }
  }

  const cleanUrl = envUrl.replace(/\/+$/, "");
  return `${cleanUrl}/ws`;
};

export const createStompClient = (topic, onMessageReceived) => {
  const socketUrl = getSocketUrl();
  const isHttps = socketUrl.startsWith("https://");
  const brokerUrl = isHttps 
    ? socketUrl.replace("https://", "wss://") 
    : socketUrl.replace("http://", "ws://");

  const stompClient = new Client({
    brokerURL: brokerUrl,
    webSocketFactory: () => new SockJS(socketUrl),

    connectHeaders: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },

    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

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
      console.error("STOMP Broker Error:", frame.headers ? frame.headers["message"] : frame);
      if (frame.body) console.error(frame.body);
    },

    onWebSocketError: (error) => {
      console.error("WebSocket Error:", error);
    },
  });

  return stompClient;
};
