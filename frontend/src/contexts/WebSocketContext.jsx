import { createContext, useContext, useState } from "react";
import { webSocketService } from "../utils/WebSocketService.js";
import { useInterval } from "react-use";

const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  const setupListeners = (ws) => {
    const handleConnectionOpen = () => {
      console.log("WebSocket opened - updating React state");
      setIsConnected(webSocketService.isConnected());
    };

    const handleConnectionClose = () => {
      console.log("WebSocket closed - updating React state");
      setIsConnected(webSocketService.isConnected());
      cleanup();
    };

    const handleMessage = (event) => {
      const data = JSON.parse(JSON.stringify(event.data));
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    ws.addEventListener('open', handleConnectionOpen);
    ws.addEventListener('close', handleConnectionClose);
    ws.addEventListener('message', handleMessage);
    
    const cleanup = () => {
        ws.removeEventListener('open', handleConnectionOpen);
        ws.removeEventListener('close', handleConnectionClose);
        ws.removeEventListener('message', handleMessage);
    };

    return cleanup;
  };

  const popFirstMessage = () => {
    const firstMessage = messages[0];
    setMessages((prevMessages) => prevMessages.slice(1));
    return firstMessage;
  }

  const toggleMute = () => {
    console.log("Toggle called, current state:", webSocketService.isConnected());
    
    if (webSocketService.isConnected()) {
      console.log("Disconnecting...");
      webSocketService.disconnect();
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
    popFirstMessage,
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