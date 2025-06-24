import { createContext, useContext, useState, useEffect } from "react";
//import { addFavoriteToDB, removeFavoriteFromDB, getFavoritesFromDB } from "../appwrite"; // implement getFavoritesFromDB
import { useAuth } from "./AuthContext"; // to get the current user
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/Spinner";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user, jwt } = useAuth();

  const { data: favorites = [], isLoading, refetch, error } = useQuery({
    queryKey: ['favorites', user?.$id],
    queryFn: () => (user && jwt) ? getFavoritesFromDB(user.$id, jwt) : [],
    enabled: !!user && !!jwt,
    staleTime: Infinity, // Data never becomes stale
    refetchOnWindowFocus: false,
  });

  // Fetch favorites when user changes (login/logout)
  useEffect(() => {   
    if (user){
      refetch();
    }
  }, [user]);

  // const addFavorite = async (movie) => {
  //   await addFavoriteToDB(movie);
  //   setFavorites((prev) => [...prev, movie]);
  // };

  // const removeFavorite = async (movieId) => {
  //   await removeFavoriteFromDB(movieId);
  //   setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  // };

  // const isFavorite = (movieId) => favorites.some((m) => m.id === movieId);

  if (isLoading) return <Spinner/>
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  console.log(favorites)
  return (
    <FavoritesContext.Provider value={{ favorites, /*addFavorite, removeFavorite, isFavorite */}}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

async function getFavoritesFromDB(userID, jwt) {
  const response = await fetch(`${import.meta.env.VITE_FASTAPI_BASE_URL}favorites`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`,
    },
    credentials: "include",
  });
  console.log("userid: ",userID);
  if (!response.ok) throw new Error("Failed to fetch trending movies");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
}
