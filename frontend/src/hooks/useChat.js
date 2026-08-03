import { useEffect, useRef, useState } from "react";
import { createStompClient } from "../services/websocketService";

const useChat = (id, topic, destination) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!id || !topic) return;

    const client = createStompClient(topic, (incomingMessage) => {
      setMessages((previous) => [...previous, incomingMessage]);
    });

    const originalOnConnect = client.onConnect;
    client.onConnect = (frame) => {
      setIsConnected(true);
      if (originalOnConnect) originalOnConnect(frame);
    };

    const originalOnWebSocketClose = client.onWebSocketClose;
    client.onWebSocketClose = (evt) => {
      setIsConnected(false);
      if (originalOnWebSocketClose) originalOnWebSocketClose(evt);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [id, topic]);

  const sendMessage = (message) => {
    console.log(message);

    if (!clientRef.current || !clientRef.current.connected) {
      console.warn(
        "STOMP client is not yet connected. Message will be handled locally.",
      );
      return false;
    }

    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify({
          message,
        }),
      });
      return true;
    } catch (err) {
      console.error("STOMP publish error:", err);
      return false;
    }
  };

  return {
    messages,
    sendMessage,
    isConnected,
  };
};

export default useChat;
