import "./App.css";
import Search from "./components/Search.jsx";
import { useState, useEffect, use } from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from 'react-use';
import { getTredingMovies, updateSearchCount } from "./appwrite.js";

const API_KEY = import.meta.env.VITE_API_KEY;

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL;

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState(null);

  const [movies, setMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setError("");
    try {
      /*const endpoint = query
      ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${BASE_URL}/discover/movie?sort_by=popularity.desc`;*/
      const endpoint = query
        ? `${FASTAPI_BASE_URL}movies?search_term=${encodeURIComponent(query)}`
        : `${FASTAPI_BASE_URL}movies`;
      const response = await fetch(endpoint, API_OPTIONS);
      console.log(response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);

      if (data.Response === "False") {
        setError(
          data.Error || "Failed to fetch movies. Please try again later."
        );
        setMovies([]);
        return;
      }

      setMovies(data.results || []);

      if (query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);


  const loadTrendingMovies = async () => {
    try{
      const movies = await getTredingMovies();

      setTrendingMovies(movies);

    } catch (error) {
      console.error("Error loading trending movies:", error);    }
  };

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key = {movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner/>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie}></MovieCard>                
              ))}
            </ul>
          )}

          {error && <p className="text-red-500">{error}</p>}
        </section>
      </div>
    </main>
  );
};

export default App;
