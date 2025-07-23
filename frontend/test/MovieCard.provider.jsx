import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { createContext, useContext } from "react";
import "@testing-library/jest-dom";
import MovieCard from "../src/components/MovieCard.jsx";

// APPROACH 2: Create custom test contexts that mimic the real ones
const TestAuthContext = createContext();
const TestFavoritesContext = createContext();

// Override the context hooks for testing
vi.mock("../src/contexts/AuthContext.jsx", () => ({
  UseAuth: () => useContext(TestAuthContext),
}));

vi.mock("../src/contexts/FavoritesContext.jsx", () => ({
  UseFavorites: () => useContext(TestFavoritesContext),
}));

// Test wrapper component
const TestWrapper = ({ children, authValue, favoritesValue }) => (
  <BrowserRouter>
    <TestAuthContext.Provider value={authValue}>
      <TestFavoritesContext.Provider value={favoritesValue}>
        {children}
      </TestFavoritesContext.Provider>
    </TestAuthContext.Provider>
  </BrowserRouter>
);

// Helper function for rendering with test contexts
const renderWithContext = (component, { authValue, favoritesValue }) => {
  return render(
    <TestWrapper authValue={authValue} favoritesValue={favoritesValue}>
      {component}
    </TestWrapper>
  );
};

const mockMovie = {
  id: 2,
  title: "The Matrix",
  vote_average: 8.7,
  poster_path: "/matrix.jpg",
  release_date: "1999-03-31",
  original_language: "en",
};

describe("MovieCard Component - Provider Approach", () => {
  describe("authenticated user scenarios", () => {
    const mockUser = { $id: "user456", name: "Jane Doe" };
    const mockAddFavorite = vi.fn();
    const mockRemoveFavorite = vi.fn();

    it("should toggle favorite status correctly", () => {
      const mockIsFavorite = vi
        .fn()
        .mockReturnValueOnce(false) // Initial state
        .mockReturnValueOnce(true); // After clicking

      renderWithContext(<MovieCard movie={mockMovie} />, {
        authValue: {
          user: mockUser,
          isLoading: false,
        },
        favoritesValue: {
          addFavorite: mockAddFavorite,
          removeFavorite: mockRemoveFavorite,
          isFavorite: mockIsFavorite,
          isLoading: false,
        },
      });

      const heartButton = screen.getByRole("button");
      fireEvent.click(heartButton);

      expect(mockAddFavorite).toHaveBeenCalledWith(mockMovie);
    });

    it("should handle favorite removal", () => {
      const mockIsFavorite = vi.fn(() => true);

      renderWithContext(<MovieCard movie={mockMovie} />, {
        authValue: {
          user: mockUser,
          isLoading: false,
        },
        favoritesValue: {
          addFavorite: mockAddFavorite,
          removeFavorite: mockRemoveFavorite,
          isFavorite: mockIsFavorite,
          isLoading: false,
        },
      });

      const heartButton = screen.getByRole("button");
      fireEvent.click(heartButton);

      expect(mockRemoveFavorite).toHaveBeenCalledWith(mockMovie);
    });
  });

  describe("loading states with providers", () => {
    it("should show loading spinner during auth loading", () => {
      renderWithContext(<MovieCard movie={mockMovie} />, {
        authValue: {
          user: null,
          isLoading: true,
        },
        favoritesValue: {
          addFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          isFavorite: vi.fn(),
          isLoading: false,
        },
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should show loading spinner during favorites loading", () => {
      renderWithContext(<MovieCard movie={mockMovie} />, {
        authValue: {
          user: { $id: "user123" },
          isLoading: false,
        },
        favoritesValue: {
          addFavorite: vi.fn(),
          removeFavorite: vi.fn(),
          isFavorite: vi.fn(),
          isLoading: true,
        },
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
