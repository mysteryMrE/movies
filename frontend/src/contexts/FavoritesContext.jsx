import { createContext, useContext, useState, useEffect } from "react";
//import { addFavoriteToDB, removeFavoriteFromDB, getFavoritesFromDB } from "../appwrite"; // implement getFavoritesFromDB
import { useAuth } from "./AuthContext"; // to get the current user

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Fetch favorites when user changes (login/logout)
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favs = await getFavoritesFromDB(user.$id);
        setFavorites(favs);
      } else {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user]);

  const addFavorite = async (movie) => {
    await addFavoriteToDB(movie);
    setFavorites((prev) => [...prev, movie]);
  };

  const removeFavorite = async (movieId) => {
    await removeFavoriteFromDB(movieId);
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  };

  const isFavorite = (movieId) => favorites.some((m) => m.id === movieId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);