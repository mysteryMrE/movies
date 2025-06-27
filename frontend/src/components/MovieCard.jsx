import { useState } from "react";
import HeartButton from "./HeartButton.jsx";
import { UseAuth } from "../contexts/AuthContext.jsx";
import { UseFavorites } from "../contexts/FavoritesContext.jsx";

const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language },
}) => {
  const { user } = UseAuth();
  const { addFavorite, removeFavorite, isFavorite } = UseFavorites();
  const movie = { id, title, vote_average, poster_path, release_date, original_language };
  const [liked, setLiked] = useState(user ? isFavorite(movie) : false);

  

  const handleHeartClick = () => {
    if (liked) {
      removeFavorite(movie);
    } else {
      addFavorite(movie);
    }
    setLiked(prev => !prev);
  };

  return (
    <div className="movie-card">
      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500/${poster_path}`
            : "/no-movie.png"
        }
        alt={title}
      />
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="star icon" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
          {user && (
            <HeartButton 
              liked={liked} 
              onClick={handleHeartClick} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
