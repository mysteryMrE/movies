import "./App.css";
import Search from "./components/Search.jsx";
import { useState, useEffect, useRef, use } from "react";
import FavoriteMovies from "./components/FavoriteMovies.jsx";
import MovieList from "./components/MovieList.jsx";
import { useDebounce, useInterval } from "react-use";
import TrendingList from "./components/TrendingList.jsx";
import Menu from "./components/Menu.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { useLocation } from "react-router-dom";
// import Header from "./components/Header";
// import Home from "./pages/Home";
// import Profile from "./pages/Profile";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import { WebSocketProvider } from "./contexts/WebSocketContext.jsx";
import Notification from "./components/Notification.jsx";

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
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              )}
            </header>
            <Notification />
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

  // const [error, setError] = useState(null);

  // const [movies, setMovies] = useState([]);
  // const [trendingMovies, setTrendingMovies] = useState([]);

  // const [isLoading, setIsLoading] = useState(false);
  // const API_KEY = import.meta.env.VITE_API_KEY;
  // const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
  // const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL;
  // const API_OPTIONS = {
  //   method: "GET",
  //   headers: {
  //     accept: "application/json",
  //     Authorization: `Bearer ${API_KEY}`,
  //   },
  // };
  // const fetchMovies = async (query = '') => {
  //   setIsLoading(true);
  //   setError("");
  //   try {
  //     /*const endpoint = query
  //     ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
  //     : `${BASE_URL}/discover/movie?sort_by=popularity.desc`;*/
  //     const endpoint = query
  //       ? `${FASTAPI_BASE_URL}movies?search_term=${encodeURIComponent(query)}`
  //       : `${FASTAPI_BASE_URL}movies`;
  //     const response = await fetch(endpoint, API_OPTIONS);
  //     console.log(response);

  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const data = await response.json();
  //     console.log(data);

  //     if (data.Response === "False") {
  //       setError(
  //         data.Error || "Failed to fetch movies. Please try again later."
  //       );
  //       setMovies([]);
  //       return;
  //     }

  //     setMovies(data.results || []);

  //     if (query && data.results.length > 0){
  //       await updateSearchCount(query, data.results[0]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching movies:", error);
  //     setError("Failed to fetch movies. Please try again later.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchMovies(debouncedSearchTerm);
  // }, [debouncedSearchTerm]);

  // {
  //   {
  //     isLoading ? (
  //       <Spinner />
  //     ) : error ? (
  //       <p className="text-red-500">{error}</p>
  //     ) : (
  //       <ul>
  //         {movies.map((movie) => (
  //           <MovieCard key={movie.id} movie={movie}></MovieCard>
  //         ))}
  //       </ul>
  //     );
  //   }

  //   {
  //     error && <p className="text-red-500">{error}</p>;
  //   }
  // }
  // useEffect(() => {
  //   loadTrendingMovies();
  // }, []);

  // const loadTrendingMovies = async () => {
  //   try {
  //     const movies = await getTredingMovies();

  //     setTrendingMovies(movies);
  //   } catch (error) {
  //     console.error("Error loading trending movies:", error);
  //   }
  // };
  // {
  //   trendingMovies.length > 0 && (
  //     <section className="trending">
  //       <h2>Trending Movies</h2>
  //       <ul>
  //         {trendingMovies.map((movie, index) => (
  //           <li key={movie.$id}>
  //             <p>{index + 1}</p>
  //             <img src={movie.poster_url} alt={movie.title} />
  //           </li>
  //         ))}
  //       </ul>
  //     </section>
  //   );
  // }
};

export default App;