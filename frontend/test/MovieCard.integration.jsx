import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import MovieCard from "../src/components/MovieCard.jsx";

// APPROACH 3: Integration testing with real contexts (but mocked dependencies)

// Mock the external dependencies
vi.mock("../src/config.js", () => ({
  config: {
    appwriteAccount: {
      get: vi.fn(),
      createEmailPasswordSession: vi.fn(),
    },
    fastapiBaseUrl: "http://localhost:8000",
  },
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock WebSocket
vi.mock("../src/utils/WebSocketService.js", () => ({
  default: class MockWebSocketService {
    connect = vi.fn();
    disconnect = vi.fn();
    sendMessage = vi.fn();
    onMessage = vi.fn();
  },
}));

const mockMovie = {
  id: 3,
  title: "Interstellar",
  vote_average: 8.6,
  poster_path: "/interstellar.jpg",
  release_date: "2014-11-07",
  original_language: "en",
};

// Create a test wrapper with all necessary providers
const TestProviders = ({ children, user = null, favorites = [] }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Mock the auth context with real structure
  const authContextValue = {
    user,
    isLoading: false,
    jwt: user ? "mock-jwt-token" : null,
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
  };

  const favoritesContextValue = {
    favorites,
    isLoading: false,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn((movie) => favorites.some((fav) => fav.id === movie.id)),
  };

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* In a real scenario, you'd provide your actual contexts here */}
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe("MovieCard Component - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  it("should render correctly for anonymous user", () => {
    render(
      <TestProviders>
        <MovieCard movie={mockMovie} />
      </TestProviders>
    );

    expect(screen.getByText("Interstellar")).toBeInTheDocument();
    expect(screen.getByText("8.6")).toBeInTheDocument();
    expect(screen.getByText("2014")).toBeInTheDocument();
    expect(screen.getByText("en")).toBeInTheDocument();
  });

  it("should display movie poster correctly", () => {
    render(
      <TestProviders>
        <MovieCard movie={mockMovie} />
      </TestProviders>
    );

    const image = screen.getByAltText("Interstellar");
    expect(image).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w500/interstellar.jpg"
    );
  });

  // Note: For full integration tests, you'd need to actually provide your real contexts
  // This is just showing the structure - you'd replace the mock contexts above
  // with your actual AuthProvider and FavoritesProvider components
});
