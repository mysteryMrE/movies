import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { webSocketService } from "../utils/WebSocketService.js";
import { UseAuth } from "./AuthContext.jsx";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);
  const messageQueueRef = useRef([]);
  const { user, jwt } = UseAuth();
  const cleanupRef = useRef(null);

  const setupListeners = (ws) => {
    const handleConnectionOpen = () => {
      setIsConnected(webSocketService.isConnected());
    };

    const handleConnectionClose = () => {
      setIsConnected(webSocketService.isConnected());
      cleanup();
    };

    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      setMessageQueue((prevQueue) => {
        const newQueue = [...prevQueue, data];
        messageQueueRef.current = newQueue;
        return newQueue;
      });
    };

    ws.addEventListener("open", handleConnectionOpen);
    ws.addEventListener("close", handleConnectionClose);
    ws.addEventListener("message", handleMessage);

    const cleanup = () => {
      ws.removeEventListener("open", handleConnectionOpen);
      ws.removeEventListener("close", handleConnectionClose);
      ws.removeEventListener("message", handleMessage);
    };

    return cleanup;
  };

  const popFirstMessage = useCallback(() => {
    const currentQueue = messageQueueRef.current;

    if (currentQueue.length === 0) {
      return null;
    }

    const capturedMessage = currentQueue[0];

    setMessageQueue((prevQueue) => {
      const newQueue = prevQueue.slice(1);
      messageQueueRef.current = newQueue;
      return newQueue;
    });
    return capturedMessage;
  }, []);

  const toggleMute = () => {
    if (!user) return;
    if (webSocketService.isConnected()) {
      webSocketService.disconnect();
    } else {
      webSocketService.connect(user.$id, jwt);

      // Set up listeners on the NEW WebSocket instance
      if (webSocketService.ws) {
        cleanupRef.current = setupListeners(webSocketService.ws);
      }
    }
    setMessageQueue((prev) => {
      const newQueue = [];
      messageQueueRef.current = newQueue;
      return newQueue;
    });
  };

  //this context wont ever unmount, but this effect here incase we modify something
  useEffect(() => {
    return () => {
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (webSocketService.isConnected()) {
        webSocketService.disconnect();
      }
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      setIsConnected(false);
      setMessageQueue((prevQueue) => {
        const newQueue = [];
        messageQueueRef.current = newQueue;
        return newQueue;
      });
    };
  }, [user]);

  const sendMessage = (message) => {
    webSocketService.send(message);
  };

  const contextData = {
    popFirstMessage,
    messageQueue,
    isConnected,
    toggleMute,
    sendMessage,
    messageQueueRef,
  };
  const defaultContextData = {
    popFirstMessage: () => "",
    messageQueue: [],
    isConnected: false,
    toggleMute: () => {},
    sendMessage: () => {},
    messageQueueRef: { current: [] },
  };

  return (
    <WebSocketContext.Provider
      value={contextData ? contextData : defaultContextData}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

const UseWebSocket = () => {
  return useContext(WebSocketContext);
};

export { WebSocketProvider, UseWebSocket };
