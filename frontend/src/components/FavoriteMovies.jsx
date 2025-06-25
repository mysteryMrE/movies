import { UseFavorites } from "../contexts/FavoritesContext";

function FavoriteMovies() {
  const { favorites, isLoading } = UseFavorites();

  if (isLoading) return <div className="favorite-li" >Loading...</div>;

  const favoriteList = favorites?.favorites ?? [];

  return (
    <div>
      <h2>Your favorites</h2>
      <ul>
        {favoriteList.map((favorite) => (
          <li className="favorite-li" key={`favorite-${favorite}`}>{favorite}</li>
        ))}
      </ul>
    </div>
  );
}

export default FavoriteMovies;