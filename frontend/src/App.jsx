import "./App.css";
import Search from "./components/Search.jsx";
import { useState } from "react";
import FavoriteMovies from "./components/FavoriteMovies.jsx";
import MovieList from "./components/MovieList.jsx";
import { useDebounce } from "react-use";
import TrendingList from "./components/TrendingList.jsx";
import Menu from "./components/Menu.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { useLocation } from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import { WebSocketProvider } from "./contexts/WebSocketContext.jsx";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const location = useLocation();

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <AuthProvider>
          <WebSocketProvider>
            <FavoritesProvider>
              <header>
                <Menu />
                <img src="./hero.png" alt="Hero Banner" />
                {location.pathname === "/" && (
                  <Search
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                )}
              </header>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <TrendingList />
                      <MovieList searchTerm={debouncedSearchTerm} />
                    </>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<PrivateRoutes />}>
                  <Route path="/favorites" element={<FavoriteMovies />} />
                </Route>
              </Routes>
            </FavoritesProvider>
          </WebSocketProvider>
        </AuthProvider>
      </div>
    </main>
  );
};

export default App;
