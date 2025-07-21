// Mock import.meta
global.meta = {
  env: {
    VITE_APPWRITE_ENDPOINT: "http://localhost:8000",
    VITE_APPWRITE_PROJECT_ID: "test-project",
    VITE_FASTAPI_BASE_URL: "http://localhost:8000",
    VITE_FASTAPI_BASE_SOCKET: "ws://localhost:8000/ws",
  },
};

// Set up window object before importing config
global.window = {
  APP_CONFIG: {
    VITE_APPWRITE_ENDPOINT: "http://localhost:8000",
    VITE_APPWRITE_PROJECT_ID: "test-project",
    VITE_FASTAPI_BASE_URL: "http://localhost:8000",
    VITE_FASTAPI_BASE_SOCKET: "ws://localhost:8000/ws",
  },
};

// Mock the config module completely to avoid complex dependencies
jest.mock("../src/config", () => ({
  config: {
    appwriteUrl: "http://localhost:8000",
    appwriteProjectId: "test-project",
    fastapiBaseUrl: "http://localhost:8000",
    fastapiBaseSocket: "ws://localhost:8000/ws",
  },
}));

import { webSocketService } from "../src/utils/WebSocketService";

// Create a proper WebSocket mock
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;

    // Mock methods
    this.send = jest.fn();
    this.close = jest.fn((code, reason) => {
      this.readyState = MockWebSocket.CLOSED;
      if (this.onclose) {
        this.onclose({ code, reason });
      }
    });

    // Store instance for test access
    MockWebSocket.lastInstance = this;
  }

  // Helper methods for testing
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen();
    }
  }

  simulateClose(code = 1000, reason = "Normal closure") {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose({ code, reason });
    }
  }

  simulateError(error = new Error("WebSocket error")) {
    if (this.onerror) {
      this.onerror(error);
    }
  }

  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// Set up global WebSocket mock
global.WebSocket = MockWebSocket;

describe("WebSocketService", () => {
  beforeEach(() => {
    // Reset the service to initial state
    webSocketService.ws = null;
    webSocketService.connected = false;
    webSocketService.connecting = false;
    webSocketService.reconnectAttempts = 0;

    // Clear all mocks
    jest.clearAllMocks();
    MockWebSocket.lastInstance = null;
  });

  describe("Initial State", () => {
    test("should initialize with correct default values", () => {
      expect(webSocketService.ws).toBeNull();
      expect(webSocketService.connected).toBe(false);
      expect(webSocketService.connecting).toBe(false);
      expect(webSocketService.reconnectAttempts).toBe(0);
      expect(webSocketService.maxReconnectAttempts).toBe(5);
      expect(webSocketService.reconnectDelay).toBe(3000);
    });

    test("should not be connected initially", () => {
      expect(webSocketService.isConnected()).toBe(false);
    });
  });

  //   describe("Connection", () => {
  //     test("should create WebSocket connection with correct URL", () => {
  //       const userId = "test-user-123";
  //       const jwt = "test-jwt-token";

  //       webSocketService.connect(userId, jwt);

  //       expect(MockWebSocket).toHaveBeenCalledWith(
  //         "ws://localhost:8000/ws/test-user-123?jwt=test-jwt-token"
  //       );
  //       expect(webSocketService.connecting).toBe(true);
  //       expect(webSocketService.ws).toBe(MockWebSocket.lastInstance);
  //     });

  //     test("should not create new connection if already connecting", () => {
  //       webSocketService.connecting = true;
  //       const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

  //       webSocketService.connect("user", "jwt");

  //       expect(MockWebSocket).not.toHaveBeenCalled();
  //       expect(consoleSpy).toHaveBeenCalledWith(
  //         "WebSocket is already connecting or connected."
  //       );

  //       consoleSpy.mockRestore();
  //     });

  //     test("should not create new connection if already connected", () => {
  //       webSocketService.connected = true;
  //       const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

  //       webSocketService.connect("user", "jwt");

  //       expect(MockWebSocket).not.toHaveBeenCalled();
  //       expect(consoleSpy).toHaveBeenCalledWith(
  //         "WebSocket is already connecting or connected."
  //       );

  //       consoleSpy.mockRestore();
  //     });

  //     test("should handle successful connection", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;

  //       // Simulate successful connection
  //       mockWs.simulateOpen();

  //       expect(webSocketService.connecting).toBe(false);
  //       expect(webSocketService.connected).toBe(true);
  //       expect(webSocketService.reconnectAttempts).toBe(0);
  //       expect(mockWs.send).toHaveBeenCalledWith(
  //         JSON.stringify({ type: "ping", timestamp: expect.any(Number) })
  //       );
  //     });

  //     test("should handle connection close", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;

  //       // First open the connection
  //       mockWs.simulateOpen();
  //       expect(webSocketService.connected).toBe(true);

  //       // Then close it
  //       mockWs.simulateClose();
  //       expect(webSocketService.connected).toBe(false);
  //     });

  //     test("should handle connection error", () => {
  //       const consoleSpy = jest.spyOn(console, "error").mockImplementation();

  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;

  //       // Simulate error
  //       const testError = new Error("Connection failed");
  //       mockWs.simulateError(testError);

  //       expect(webSocketService.connecting).toBe(false);
  //       expect(webSocketService.connected).toBe(false);
  //       expect(consoleSpy).toHaveBeenCalledWith("WebSocket error:", testError);

  //       consoleSpy.mockRestore();
  //     });
  //   });

  //   describe("Disconnection", () => {
  //     test("should disconnect and clean up properly", () => {
  //       // First connect
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();

  //       // Then disconnect
  //       webSocketService.disconnect();

  //       expect(mockWs.close).toHaveBeenCalledWith(1000, "User disconnected");
  //       expect(webSocketService.ws).toBeNull();
  //       expect(webSocketService.connected).toBe(false);
  //       expect(webSocketService.connecting).toBe(false);
  //       expect(webSocketService.reconnectAttempts).toBe(0);
  //     });

  //     test("should handle disconnect when no connection exists", () => {
  //       // Should not throw error
  //       expect(() => webSocketService.disconnect()).not.toThrow();

  //       expect(webSocketService.connected).toBe(false);
  //       expect(webSocketService.connecting).toBe(false);
  //       expect(webSocketService.reconnectAttempts).toBe(0);
  //     });
  //   });

  //   describe("Message Sending", () => {
  //     test("should send message when connected", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();

  //       const testMessage = { type: "test", data: "hello" };
  //       const result = webSocketService.send(testMessage);

  //       expect(result).toBe(true);
  //       expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
  //     });

  //     test("should not send message when not connected", () => {
  //       const testMessage = { type: "test", data: "hello" };
  //       const result = webSocketService.send(testMessage);

  //       expect(result).toBe(false);
  //     });

  //     test("should not send message when WebSocket is not open", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       // Don't simulate open, so readyState remains CONNECTING

  //       const testMessage = { type: "test", data: "hello" };
  //       const result = webSocketService.send(testMessage);

  //       expect(result).toBe(false);
  //       expect(mockWs.send).not.toHaveBeenCalled();
  //     });
  //   });

  //   describe("Connection Status", () => {
  //     test("should return false when no WebSocket exists", () => {
  //       expect(webSocketService.isConnected()).toBe(false);
  //     });

  //     test("should return false when WebSocket is connecting", () => {
  //       webSocketService.connect("user", "jwt");
  //       // Don't simulate open, so it stays in CONNECTING state

  //       expect(webSocketService.isConnected()).toBe(false);
  //     });

  //     test("should return true when properly connected", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();

  //       expect(webSocketService.isConnected()).toBe(true);
  //     });

  //     test("should return false when connection is closed", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();
  //       expect(webSocketService.isConnected()).toBe(true);

  //       mockWs.simulateClose();
  //       expect(webSocketService.isConnected()).toBe(false);
  //     });

  //     test("should return false when WebSocket is closed but internal flag is true", () => {
  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();

  //       // Manually close WebSocket without triggering onclose
  //       mockWs.readyState = MockWebSocket.CLOSED;

  //       expect(webSocketService.isConnected()).toBe(false);
  //     });
  //   });

  //   describe("Edge Cases", () => {
  //     test("should handle multiple rapid connect/disconnect cycles", () => {
  //       const userId = "user";
  //       const jwt = "jwt";

  //       // Connect
  //       webSocketService.connect(userId, jwt);
  //       let mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();
  //       expect(webSocketService.isConnected()).toBe(true);

  //       // Disconnect
  //       webSocketService.disconnect();
  //       expect(webSocketService.isConnected()).toBe(false);

  //       // Connect again
  //       webSocketService.connect(userId, jwt);
  //       mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();
  //       expect(webSocketService.isConnected()).toBe(true);

  //       // Should work fine
  //       expect(MockWebSocket).toHaveBeenCalledTimes(2);
  //     });

  //     test("should reset reconnect attempts on successful connection", () => {
  //       webSocketService.reconnectAttempts = 3;

  //       webSocketService.connect("user", "jwt");
  //       const mockWs = MockWebSocket.lastInstance;
  //       mockWs.simulateOpen();

  //       expect(webSocketService.reconnectAttempts).toBe(0);
  //     });
  //   });
});
