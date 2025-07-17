import { UseWebSocket } from "../contexts/WebSocketContext";
import { useState, useRef, useEffect } from "react";

const Notification = () => {
  const { popFirstMessage, messageQueue } = UseWebSocket();
  const [message, setMessage] = useState("");
  const draining = useRef(false);

  useEffect(() => {
    if (!draining.current && messageQueue.length > 0) {
      draining.current = true;

      const loop = async () => {
        let currentMessage;
        
        while ((currentMessage = popFirstMessage()) !== null) {
          setMessage(currentMessage);
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        setMessage(null);
        draining.current = false;
      };

      loop();
    }
  }, [messageQueue]);

  return (
    message ? <p className="notification">{JSON.stringify(message)}</p> : <></>
  );
};

export default Notification;