import { UseFavorites } from "../contexts/FavoritesContext";
import MovieCard from "./MovieCard";
import Spinner from "./Spinner";

function FavoriteMovies() {
  const { favorites, isLoading, removeFavorite } = UseFavorites();

  if (isLoading) return <div className="favorite-li">Loading...</div>;

  const favoriteList = favorites ?? [];

  return (
    <section className="all-movies">
      <h2 className="favorite-title">
        <span className="text-gradient">Your favorites</span>
      </h2>
      {isLoading ? (
        <Spinner />
      ) : favoriteList.length === 0 ? (
        <div className="favorite-none">You have no favorite movies yet</div>
      ) : (
        <ul>
          {favoriteList.map((favorite) => (
            <li className="favorite-li" key={`favoriteli-${favorite.id}`}>
              <MovieCard
                key={`favoritecard-${favorite.id}`}
                movieId={favorite.id}
                movie={favorite}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FavoriteMovies;
