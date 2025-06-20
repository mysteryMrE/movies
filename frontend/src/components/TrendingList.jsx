import { useQuery } from "@tanstack/react-query";
import Spinner from "./Spinner.jsx";

function TrendingList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trending-movies"],
    queryFn: fetchTrendingMovies,
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No trending movies found.</p>;

  const movies = data.map((movie) => ({
    ...movie,
    movie_json: movie.movie_json ? JSON.parse(movie.movie_json) : null,
  }));
  console.log("Trending movies:", movies);
  return (
    <section className="trending">
      <h2>Trending Movies</h2>
      <ul>
        {data.map((movie, index) => (
          <li key={movie.$id}>
            <p>{index + 1}</p>
            <img src={movie.poster_url} alt={movie.title} />
          </li>
        ))}
      </ul>
    </section>
  );
};

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL;

const fetchTrendingMovies = async () => {
  const response = await fetch(`${FASTAPI_BASE_URL}movies/trending`);
  if (!response.ok) throw new Error("Failed to fetch trending movies");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
};

export default TrendingList;