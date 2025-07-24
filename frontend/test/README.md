# Testing React Components with Context - Guide

This guide explains different approaches to testing React components that use context, using your MovieCard component as an example.

## Approaches for Testing Components with Context

### 1. Mock the Context Hooks (Recommended for Unit Tests)

**When to use**: When you want to test the component in isolation and focus on its rendering logic and event handling.

**Pros**:

- Fast and simple
- Complete control over context values
- Easy to test edge cases
- No need to set up complex providers

**Cons**:

- Doesn't test integration with real contexts
- Requires mocking context modules

```jsx
// Mock the context hooks directly
vi.mock("../src/contexts/AuthContext.jsx", () => ({
  UseAuth: vi.fn(),
}));

vi.mock("../src/contexts/FavoritesContext.jsx", () => ({
  UseFavorites: vi.fn(),
}));

// In your test:
UseAuth.mockReturnValue({
  user: mockUser,
  isLoading: false,
});

UseFavorites.mockReturnValue({
  addFavorite: mockAddFavorite,
  removeFavorite: mockRemoveFavorite,
  isFavorite: vi.fn(() => false),
  isLoading: false,
});
```

### 2. Custom Test Providers (Good for Component Testing)

**When to use**: When you want more realistic testing but still want control over context values.

**Pros**:

- More realistic than mocking
- Still allows precise control
- Reusable test utilities

**Cons**:

- More setup required
- Still not testing real context logic

```jsx
// Create test contexts
const TestAuthContext = createContext();
const TestFavoritesContext = createContext();

// Create wrapper component
const TestWrapper = ({ children, authValue, favoritesValue }) => (
  <TestAuthContext.Provider value={authValue}>
    <TestFavoritesContext.Provider value={favoritesValue}>
      {children}
    </TestFavoritesContext.Provider>
  </TestAuthContext.Provider>
);
```

### 3. Integration Testing with Real Providers

**When to use**: When you want to test the actual integration between your component and contexts.

**Pros**:

- Tests real behavior
- Catches integration bugs
- More confidence in the code

**Cons**:

- More complex setup
- Slower tests
- Harder to isolate failures

```jsx
// Use your actual providers but mock external dependencies
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);
```

## Best Practices

### 1. Create Reusable Test Utilities

```jsx
// test/utils/test-utils.jsx
export const renderWithProviders = (ui, options = {}) => {
  const {
    authValue = defaultAuthValue,
    favoritesValue = defaultFavoritesValue,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <TestProviders authValue={authValue} favoritesValue={favoritesValue}>
      {children}
    </TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
```

### 2. Use Factory Functions for Mock Data

```jsx
export const createMockMovie = (overrides = {}) => ({
  id: 1,
  title: "Test Movie",
  vote_average: 8.5,
  poster_path: "/test-poster.jpg",
  release_date: "2023-01-01",
  original_language: "en",
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  $id: "user123",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});
```

### 3. Test Different Scenarios

```jsx
describe("MovieCard", () => {
  describe("when user is not authenticated", () => {
    // Test anonymous user behavior
  });

  describe("when user is authenticated", () => {
    // Test authenticated user behavior
  });

  describe("loading states", () => {
    // Test various loading combinations
  });

  describe("edge cases", () => {
    // Test missing data, errors, etc.
  });
});
```

### 4. Use Good Testing Queries

```jsx
// Prefer accessible queries
screen.getByRole("button"); // Better than getByTestId
screen.getByText("Movie Title"); // Test what users see
screen.getByAltText("Movie poster"); // Test accessibility

// Use query variants appropriately
expect(screen.queryByRole("button")).not.toBeInTheDocument(); // For absence
expect(screen.getByRole("button")).toBeInTheDocument(); // When it should exist
await screen.findByText("Loading..."); // For async content
```

## Running Your Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test MovieCard.test.jsx

# Run tests with coverage
npm test -- --coverage
```

## Common Testing Patterns for Your App

### Testing Heart Button Functionality

```jsx
it("should toggle favorite when heart is clicked", async () => {
  const mockAddFavorite = vi.fn();

  renderWithMocks({
    authValue: { user: mockUser, isLoading: false },
    favoritesValue: {
      addFavorite: mockAddFavorite,
      isFavorite: () => false,
      isLoading: false,
    },
  });

  const heartButton = screen.getByRole("button");
  await user.click(heartButton);

  expect(mockAddFavorite).toHaveBeenCalledWith(mockMovie);
});
```

### Testing Loading States

```jsx
it("should show spinner when loading", () => {
  renderWithMocks({
    authValue: { user: null, isLoading: true },
    favoritesValue: { isLoading: false },
  });

  expect(screen.getByRole("status")).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```jsx
it("should not show heart button for anonymous users", () => {
  renderWithMocks({
    authValue: { user: null, isLoading: false },
    favoritesValue: { isLoading: false },
  });

  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
```

This approach gives you comprehensive testing capabilities while keeping your tests maintainable and fast!
