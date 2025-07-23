import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, getByText } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MovieCard from "../src/components/MovieCard.jsx";
import userEvent from "@testing-library/user-event";

vi.mock("../src/contexts/AuthContext.jsx", () => ({
  UseAuth: vi.fn(),
}));

vi.mock("../src/contexts/FavoritesContext.jsx", () => ({
  UseFavorites: vi.fn(),
}));

import { UseAuth } from "../src/contexts/AuthContext.jsx";
import { UseFavorites } from "../src/contexts/FavoritesContext.jsx";

// Mock data
const mockMovie = {
  id: 1,
  title: "Inception",
  vote_average: 8.8,
  poster_path: "/inception.jpg",
  release_date: "2010-07-16",
  original_language: "en",
};

const mockUser = {
  $id: "user123",
  name: "John Doe",
  email: "john@example.com",
};

describe("MovieCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderMovieCard = () => {
    return render(
      <BrowserRouter>
        <MovieCard movie={mockMovie} />
      </BrowserRouter>
    );
  };

  describe("when user is not authenticated", () => {
    beforeEach(() => {
      UseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      UseFavorites.mockReturnValue({
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(() => false),
        isLoading: false,
      });
    });

    it("should render movie information correctly", () => {
      renderMovieCard();

      expect(screen.getByText("Inception")).toBeInTheDocument();
      expect(screen.getByText("8.8")).toBeInTheDocument();
      expect(screen.getByText("en")).toBeInTheDocument();
      expect(screen.getByText("2010")).toBeInTheDocument();
    });

    it("should not render heart button when user is not logged in", () => {
      renderMovieCard();

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should display fallback image when poster_path is null", () => {
      const movieWithoutPoster = { ...mockMovie, poster_path: null };

      render(
        <BrowserRouter>
          <MovieCard movie={movieWithoutPoster} />
        </BrowserRouter>
      );

      const image = screen.getByAltText("Inception");
      expect(image).toHaveAttribute("src", "/no-movie.png");
    });
  });

  describe("when user is authenticated", () => {
    const mockAddFavorite = vi.fn(() => {
      console.log("Adding favorite");
      mockIsFavorite.mockReturnValue(true);
    });
    const mockRemoveFavorite = vi.fn(() => {
      console.log("Removing favorite");
      mockIsFavorite.mockReturnValue(false);
    });
    const mockIsFavorite = vi.fn();
    const mockUser = userEvent.setup();

    beforeEach(() => {
      UseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
      });

      UseFavorites.mockReturnValue({
        addFavorite: mockAddFavorite,
        removeFavorite: mockRemoveFavorite,
        isFavorite: mockIsFavorite,
        isLoading: false,
      });
    });

    it("should render heart button when user is logged in", () => {
      mockIsFavorite.mockReturnValue(false);
      renderMovieCard();

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should call addFavorite and change label to Unlike when clicking heart on non-favorite movie", async () => {
      mockIsFavorite.mockReturnValue(false);
      renderMovieCard();
      const heartButton = screen.getByRole("button");
      expect(heartButton).toHaveAttribute("aria-label", "Like");

      await userEvent.click(heartButton);

      expect(mockAddFavorite).toHaveBeenCalledWith(mockMovie);
      expect(heartButton).toHaveAttribute("aria-label", "Unlike");
    });

    it("should call removeFavorite and change label to Like when clicking heart on favorite movie", async () => {
      mockIsFavorite.mockReturnValue(true);
      renderMovieCard();
      const heartButton = screen.getByRole("button");
      expect(heartButton).toHaveAttribute("aria-label", "Unlike");

      await userEvent.click(heartButton);

      expect(mockRemoveFavorite).toHaveBeenCalledWith(mockMovie);
      expect(heartButton).toHaveAttribute("aria-label", "Like");
    });
  });

  describe("loading states", () => {
    it("should show spinner when auth is loading", () => {
      UseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      });

      UseFavorites.mockReturnValue({
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        isLoading: false,
      });

      renderMovieCard();

      screen.debug();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText(mockMovie.title)).not.toBeInTheDocument();
      expect(true).toBe(true);
    });

    it("should show spinner when auth is loading", () => {
      UseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      UseFavorites.mockReturnValue({
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(),
        isLoading: true,
      });

      renderMovieCard();

      screen.debug();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText(mockMovie.title)).not.toBeInTheDocument();
      expect(true).toBe(true);
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      UseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      UseFavorites.mockReturnValue({
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: vi.fn(() => false),
        isLoading: false,
      });
    });

    it("should handle missing vote_average", () => {
      const movieWithoutRating = { ...mockMovie, vote_average: null };

      render(
        <BrowserRouter>
          <MovieCard movie={movieWithoutRating} />
        </BrowserRouter>
      );

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should handle missing release_date", () => {
      const movieWithoutDate = { ...mockMovie, release_date: null };

      render(
        <BrowserRouter>
          <MovieCard movie={movieWithoutDate} />
        </BrowserRouter>
      );

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });
  });
});
