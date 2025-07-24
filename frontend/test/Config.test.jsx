import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("appwrite", () => {
  return {
    Client: vi.fn().mockImplementation(() => {
      return {
        setEndpoint: vi.fn().mockReturnThis(),
        setProject: vi.fn(),
      };
    }),
    Account: vi.fn(),
  };
});

const windowConfig = {
  VITE_APPWRITE_ENDPOINT: "https://appwrite.io",
  VITE_APPWRITE_PROJECT_ID: "project123",
  VITE_FASTAPI_BASE_URL: "https://api.example.com",
  VITE_FASTAPI_BASE_SOCKET: "wss://api.example.com/socket",
};

const fallbackConfig = {
  VITE_APPWRITE_ENDPOINT: "https://fallback.appwrite.io",
  VITE_APPWRITE_PROJECT_ID: "fallback-project",
  VITE_FASTAPI_BASE_URL: "https://fallback.api.com",
  VITE_FASTAPI_BASE_SOCKET: "wss://fallback.api.com/socket",
};

function mockEnvs() {
  vi.stubEnv("VITE_APPWRITE_ENDPOINT", fallbackConfig.VITE_APPWRITE_ENDPOINT);
  vi.stubEnv(
    "VITE_APPWRITE_PROJECT_ID",
    fallbackConfig.VITE_APPWRITE_PROJECT_ID
  );
  vi.stubEnv("VITE_FASTAPI_BASE_URL", fallbackConfig.VITE_FASTAPI_BASE_URL);
  vi.stubEnv(
    "VITE_FASTAPI_BASE_SOCKET",
    fallbackConfig.VITE_FASTAPI_BASE_SOCKET
  );
}

describe("getConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    globalThis.window = {};
    mockEnvs();
  });

  it("should load config from window.APP_CONFIG if available", async () => {
    globalThis.window.APP_CONFIG = windowConfig;

    const { config } = await import("../src/config.js");

    expect(config.appwriteUrl).toBe(windowConfig.VITE_APPWRITE_ENDPOINT);
    expect(config.appwriteProjectId).toBe(
      windowConfig.VITE_APPWRITE_PROJECT_ID
    );
    expect(config.fastapiBaseUrl).toBe(windowConfig.VITE_FASTAPI_BASE_URL);
    expect(config.fastapiBaseSocket).toBe(
      windowConfig.VITE_FASTAPI_BASE_SOCKET
    );
    expect(config.appwriteAccount).toBeDefined();
  });

  it("should fall back to import.meta.env when window.APP_CONFIG is not set", async () => {
    globalThis.window.APP_CONFIG = undefined;

    const { config } = await import("../src/config.js");

    expect(config.appwriteUrl).toBe(fallbackConfig.VITE_APPWRITE_ENDPOINT);
    expect(config.appwriteProjectId).toBe(
      fallbackConfig.VITE_APPWRITE_PROJECT_ID
    );
    expect(config.fastapiBaseUrl).toBe(fallbackConfig.VITE_FASTAPI_BASE_URL);
    expect(config.fastapiBaseSocket).toBe(
      fallbackConfig.VITE_FASTAPI_BASE_SOCKET
    );
    expect(config.appwriteAccount).toBeDefined();
  });
});
