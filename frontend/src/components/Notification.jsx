import { UseWebSocket } from "../contexts/WebSocketContext";
import { useState, useRef, useEffect } from "react";

const Notification = () => {
  const { popFirstMessage, messageQueueRef, isConnected, toggleMute } =
    UseWebSocket();
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const draining = useRef(false);

  useEffect(() => {
    //console.log("trying")
    if (!draining.current && messageQueueRef.current.length > 0) {
      draining.current = true;
      //console.log("going");
      const loop = async () => {
        let currentMessage;

        while ((currentMessage = popFirstMessage()) !== null && (currentMessage.type === "connection_established" || currentMessage.type === "favorite_confirmed" || currentMessage.type === "new_favorite")) {
          setMessage(currentMessage);
          setIsVisible(true);
          setFadeOut(false);
          
          // Wait for the message to be displayed
          await new Promise((resolve) => setTimeout(resolve, 3700));
          
          // Start fade out animation
          setFadeOut(true);
          
          // Wait for fade out to complete
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        setMessage(null);
        setIsVisible(false);
        setFadeOut(false);
        draining.current = false;
      };

      loop();
    }
  }, [messageQueueRef.current]);

  return (
    <>
      {message && isVisible && (
        <div className={`notification ${fadeOut ? 'fade-out' : ''}`}>
          {message.message}
        </div>
      )}
      <button className="log-button" onClick={toggleMute}>
        {isConnected ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-bell"
            viewBox="0 0 16 16"
          >
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-bell-slash"
            viewBox="0 0 16 16"
          >
            <path d="M5.164 14H15c-.299-.199-.557-.553-.78-1-.9-1.8-1.22-5.12-1.22-6q0-.396-.06-.776l-.938.938c.02.708.157 2.154.457 3.58.161.767.377 1.566.663 2.258H6.164zm5.581-9.91a4 4 0 0 0-1.948-1.01L8 2.917l-.797.161A4 4 0 0 0 4 7c0 .628-.134 2.197-.459 3.742q-.075.358-.166.718l-1.653 1.653q.03-.055.059-.113C2.679 11.2 3 7.88 3 7c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0c.942.19 1.788.645 2.457 1.284zM10 15a2 2 0 1 1-4 0zm-9.375.625a.53.53 0 0 0 .75.75l14.75-14.75a.53.53 0 0 0-.75-.75z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default Notification;
