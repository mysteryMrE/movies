import { useState, useEffect, use } from "react";
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
  const { user, isLoading : isAuthLoading } = UseAuth();
  const { addFavorite, removeFavorite, isFavorite, isLoading : isFavoritesLoading } = UseFavorites();
  const movie = { id, title, vote_average, poster_path, release_date, original_language };
  //liked variable needed for quick reaction to heart click, so we don't have to wait for the context to update
  //which includes a fetch request to the backend
  const [liked, setLiked] = useState( isAuthLoading || isFavoritesLoading ? false : isFavorite(movie));

  //you need this because useState does not rerun its initial function on re-renders, its just returns the previous state
  useEffect(() => {
    if (!isAuthLoading && !isFavoritesLoading) {
      setLiked(isFavorite(movie));
    }
  },[isAuthLoading, isFavoritesLoading]);

  const handleHeartClick = () => {
    if (!user) console.log("You need to log in to like/unlike a movie. (don't know how you called this funciton btw)");
    if (liked) {
      removeFavorite(movie);
    } else {
      addFavorite(movie);
    }
    setLiked((prev) => !prev);
  };

  return (
    (isAuthLoading || isFavoritesLoading) ? (
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
