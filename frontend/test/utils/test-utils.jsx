import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// Test utility providers for mocking contexts
export const MockAuthProvider = ({ children, value }) => {
  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const MockFavoritesProvider = ({ children, value }) => {
  return (
    <MockFavoritesContext.Provider value={value}>
      {children}
    </MockFavoritesContext.Provider>
  );
};

// Mock contexts
import { createContext } from "react";

export const MockAuthContext = createContext();
export const MockFavoritesContext = createContext();

// Custom render function that includes common providers
export const renderWithProviders = (
  ui,
  {
    authValue = {
      user: null,
      isLoading: false,
      jwt: null,
    },
    favoritesValue = {
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
      isLoading: false,
    },
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <MockAuthContext.Provider value={authValue}>
        <MockFavoritesContext.Provider value={favoritesValue}>
          {children}
        </MockFavoritesContext.Provider>
      </MockAuthContext.Provider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to create mock movie data
export const createMockMovie = (overrides = {}) => ({
  id: 1,
  title: "Test Movie",
  vote_average: 8.5,
  poster_path: "/test-poster.jpg",
  release_date: "2023-01-01",
  original_language: "en",
  ...overrides,
});

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  $id: "user123",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});
