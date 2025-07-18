import { useState } from "react";
import HeartButton from "./HeartButton.jsx";
import { UseAuth } from "../contexts/AuthContext.jsx";
import { UseFavorites } from "../contexts/FavoritesContext.jsx";
import Spinner from "./Spinner.jsx";

//TODO: somehow on some reloads the movie is not liked, but the heart is red.
//maybe the moviecard is rendered before the favorites context is loaded?
//maybe use a useEffect to set the liked state after the favorites context is loaded?
//why doenst isLoading work here?

const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language },
}) => {
  const { user } = UseAuth();
  const { addFavorite, removeFavorite, isFavorite, isLoading } = UseFavorites();
  const movie = { id, title, vote_average, poster_path, release_date, original_language };
  const [liked, setLiked] = useState(user ? isFavorite(movie) : false);

  

  const handleHeartClick = () => {
    if (!user) console.log("You need to log in to like/unlike a movie. (don't know how you called this funciton btw)");
    if (liked) {
      removeFavorite(movie);
    } else {
      addFavorite(movie);
    }
    setLiked(prev => !prev);
  };

  return (
    isLoading ? (
      <Spinner />) :
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
