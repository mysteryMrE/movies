import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Spinner from "./Spinner.jsx";
import MovieCard from "./MovieCard.jsx";

function MovieList({ searchTerm }) {
  
  const { data, error, isLoading } = useQuery({
    queryKey: ["movies", searchTerm],
    queryFn: () => fetchMoviesFromFastAPI(searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if(data){
      console.log(`Fetched movies ${searchTerm}:`, data);
    }
  }, [searchTerm, data]);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;


  return (
    <ul>
      {data.results.map((movie) => (
        <MovieCard key={`list-${movie.id}`} movie={movie}></MovieCard>
      ))}
    </ul>
  );
}

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL;

const fetchMoviesFromFastAPI = async (query = "") => {
  const url = query
    ? `${FASTAPI_BASE_URL}movies?search_term=${encodeURIComponent(query)}`
    : `${FASTAPI_BASE_URL}movies`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export default MovieList;
