import { UseFavorites } from "../contexts/FavoritesContext";
import MovieCard from "./MovieCard";

function FavoriteMovies() {
  const { favorites, isLoading, removeFavorite } = UseFavorites();

  if (isLoading) return <div className="favorite-li" >Loading...</div>;

  const favoriteList = favorites ?? [];

  return (
    <section className="all-movies">
      <h2>Your favorites</h2>
      <ul>
        {favoriteList.map((favorite) => (
          <li className="favorite-li" key={`favoriteli-${favorite.id}`}>
            <MovieCard key={`favoritecard-${favorite.id}`} movieId={favorite.id} movie = {favorite}/>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FavoriteMovies;


