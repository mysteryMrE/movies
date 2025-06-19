const fetchMoviesFromFastAPI = async (query = "") => {
    const url = query
      ? `${FASTAPI_BASE_URL}movies?search_term=${encodeURIComponent(
          query
        )}`
      : `${FASTAPI_BASE_URL}movies`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  };


function MoviesList({ searchTerm }) {
  const { data, error, isLoading } = useQuery({
    queryKey: ['movies', searchTerm],
    queryFn: () => fetchMovies(searchTerm),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.results.map((movie) => (
        <li key={movie.id}>{movie.title}</li>
      ))}
    </ul>
  );
}