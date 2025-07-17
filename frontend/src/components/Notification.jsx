import { UseWebSocket } from "../contexts/WebSocketContext";
import { useInterval } from "react-use";
import { useState } from "react";

const Notification = ( ) =>
{
  const { popFirstMessage } = UseWebSocket();
  const [message, setMessage] = useState("");

  useInterval(() => {
    const nextMessage = popFirstMessage();
    setMessage(nextMessage);
  }, 2000);

  return (
    message ? <p className ="notification" >{message}</p> : <></>
  );
}

export default Notification;