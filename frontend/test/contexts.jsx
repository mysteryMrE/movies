import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

// APPROACH 4: Testing the contexts themselves

// Mock the config and external dependencies
vi.mock("../src/config.js", () => ({
  config: {
    appwriteAccount: {
      get: vi.fn(),
      createEmailPasswordSession: vi.fn(),
      deleteSession: vi.fn(),
    },
    fastapiBaseUrl: "http://localhost:8000",
  },
}));

// Mock fetch
global.fetch = vi.fn();

// Mock WebSocket
vi.mock("../src/contexts/WebSocketContext.jsx", () => ({
  UseWebSocket: () => ({
    sendMessage: vi.fn(),
    isConnected: true,
  }),
}));

// Import after mocking
import { AuthProvider, UseAuth } from "../src/contexts/AuthContext.jsx";
import {
  FavoritesProvider,
  UseFavorites,
} from "../src/contexts/FavoritesContext.jsx";

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  it("should provide initial auth state", () => {
    const { result } = renderHook(() => UseAuth(), { wrapper });

    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(true); // Initially loading
  });

  // Add more context-specific tests here
});

describe("FavoritesContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  const mockUser = { $id: "user123", name: "Test User" };

  // Create a wrapper that provides both contexts
  const wrapper = ({ children }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  };

  it("should provide initial favorites state", () => {
    const { result } = renderHook(() => UseFavorites(), { wrapper });

    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.addFavorite).toBe("function");
    expect(typeof result.current.removeFavorite).toBe("function");
    expect(typeof result.current.isFavorite).toBe("function");
  });

  // Note: Testing the actual functionality would require more complex mocking
  // of the auth context and API responses
});
