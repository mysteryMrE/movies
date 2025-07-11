import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import Spinner from "./Spinner.jsx";

function TrendingList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trending-movies"],
    queryFn: fetchTrendingMovies,
    staleTime: 10 * 60 * 1000,
  });

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    // Touch events for mobile
    let startTouchX;
    let startScrollLeft;

    const handleTouchStart = (e) => {
      startTouchX = e.touches[0].clientX;
      startScrollLeft = container.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!startTouchX) return;
      const touchX = e.touches[0].clientX;
      const walk = (startTouchX - touchX) * 1.5;
      container.scrollLeft = startScrollLeft + walk;
    };

    const handleTouchEnd = () => {
      startTouchX = null;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

    // Set initial cursor style
    container.style.cursor = "grab";

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [data]);

  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!data || data.length === 0) return <p>No trending movies found.</p>;
  const movies = data.map((movie) => ({
    ...movie,
    movie_json: movie.movie_json ? JSON.parse(movie.movie_json) : null,
  }));

  return (
    <section className="trending">
      <h2>Trending Movies</h2>ű
      {isLoading ? (
        <Spinner />
      ) : (
        <ul ref={scrollContainerRef} style={{ userSelect: "none" }}>
          {data.map((movie, index) => (
            <li key={movie.$id}>
              <p>{index + 1}</p>
              <img src={movie.poster_url} alt={movie.title} draggable={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

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
