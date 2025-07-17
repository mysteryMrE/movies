import {config} from "../config.js";

//TODO: Implement reconnect logic

class WebSocketService {
    constructor(){
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.connecting = false;
        this.connected = false;
    }

    connect(){
        if (this.connecting || this.connected) {
            console.warn("WebSocket is already connecting or connected.");
            return;
        }

        this.connecting = true;
        this.ws = new WebSocket(`${config.fastapiBaseSocket}/${Date.now()}`);

        this.ws.onopen = () => {
            console.log("WebSocket connection established.");
            this.connecting = false;
            this.connected = true;
            this.reconnectAttempts = 0;
            this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(JSON.stringify(event.data));
            console.log("Message received:", JSON.parse(data));
        };

        this.ws.onclose = () => {
            console.log("WebSocket connection closed.");
            this.connected = false;
            // if (this.reconnectAttempts < this.maxReconnectAttempts) {
            //     setTimeout(() => {
            //         this.reconnect();
            //     }, this.reconnectDelay);
            // } else {
            //     console.error("Max reconnect attempts reached. Giving up.");
            // }
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.connecting = false;
            this.connected = false;
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close(1000, "User disconnected");
            this.ws = null;
        }
        this.reconnectAttempts = 0;
        this.connected = false;
        this.connecting = false;
    }

    send(message) {
        if (this.isConnected()) {
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn("WebSocket not connected, message not sent:", message);
            return false;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN && this.connected;
    }
}
const webSocketService = new WebSocketService();
export { webSocketService };