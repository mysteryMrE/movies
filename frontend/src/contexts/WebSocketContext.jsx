import { createContext, useContext, useEffect, useState } from "react";
import { webSocketService } from "../utils/WebSocketService.js";
import { useInterval } from "react-use";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  const setupListeners = (ws) => {
    const handleConnectionOpen = () => {
      console.log("WebSocket opened - updating React state");
      setIsConnected(true);
    };

    const handleConnectionClose = () => {
      console.log("WebSocket closed - updating React state");
      setIsConnected(false);
    };

    ws.addEventListener('open', handleConnectionOpen);
    ws.addEventListener('close', handleConnectionClose);
    
    return () => {
      ws.removeEventListener('open', handleConnectionOpen);
      ws.removeEventListener('close', handleConnectionClose);
    };
  };

  const toggleMute = () => {
    console.log("Toggle called, current state:", webSocketService.isConnected());
    
    if (webSocketService.isConnected()) {
      console.log("Disconnecting...");
      webSocketService.disconnect();
      setIsConnected(false); // Immediate update
    } else {
      console.log("Connecting...");
      webSocketService.connect();
      
      // Set up listeners on the NEW WebSocket instance
      if (webSocketService.ws) {
        setupListeners(webSocketService.ws);
      }
    }
  };

  const sendMessage = (message) => {
    webSocketService.send(message);
  };

  const contextData = {
    isConnected,
    toggleMute,
    sendMessage
  };

  useInterval(() => {
    sendMessage({
      type: "favorite_movie",
      movie: {
        id: 123,
        title: "Test Movie",
        vote_average: 8.0,
      },
    });
  }, 5000);

  return (
    <WebSocketContext.Provider value={contextData}>
      {children}
    </WebSocketContext.Provider>
  );
};

const UseWebSocket = () => {
  return useContext(WebSocketContext);
};

export { WebSocketProvider, UseWebSocket };