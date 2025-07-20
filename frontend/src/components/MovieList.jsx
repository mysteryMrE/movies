import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Spinner from "./Spinner.jsx";
import MovieCard from "./MovieCard.jsx";
import { config } from "../config.js";

function MovieList({ searchTerm }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["movies", searchTerm],
    queryFn: () => fetchMovies(searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <section className="all-movies">
      <h2>All Movies</h2>
      {isLoading ? (
        <Spinner />
      ) : (
        <ul>
          {data.results.map((movie) => (
            <li key={`list-${movie.id}`} className="movie-item">
              <MovieCard key={`listcard-${movie.id}`} movie={movie}></MovieCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const FASTAPI_BASE_URL = config.fastapiBaseUrl;

const fetchMovies = async (query = "") => {
  const url = query
    ? `${FASTAPI_BASE_URL}/api/movies?search_term=${encodeURIComponent(query)}`
    : `${FASTAPI_BASE_URL}/api/movies`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
};

export default MovieList;
