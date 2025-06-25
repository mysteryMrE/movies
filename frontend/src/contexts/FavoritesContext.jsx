import { createContext, useContext, useState, useEffect } from "react";
//import { addFavoriteToDB, removeFavoriteFromDB, getFavoritesFromDB } from "../appwrite"; // implement getFavoritesFromDB
import { UseAuth } from "./AuthContext"; // to get the current user
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/Spinner";

const FavoritesContext = createContext();

const FavoritesProvider = ({ children }) => {
  const { user, jwt } = UseAuth();

  const {
    data: favorites = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["favorites", user?.$id],
    queryFn: () => (user && jwt ? getFavoritesFromDB(user.$id, jwt) : []),
    enabled: !!user && !!jwt,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Fetch favorites when user changes (login/logout)
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user]);

  const addFavorite = async (movie) => {
    const response = await addFavoriteToDB(movie, jwt);
    console.log(response);
    refetch();
  };

  const removeFavorite = async (movie) => {
    const response = await removeFavoriteFromDB(movie, jwt);
    console.log(response);
    refetch();
  };

  const isFavorite = false; /*(movieId) => favorites.some((m) => m.id === movieId)*/

  return (
    <FavoritesContext.Provider
      value={{
        isLoading,
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        error,
      }}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        children
      )}
    </FavoritesContext.Provider>
  );
};

const UseFavorites = () => useContext(FavoritesContext);

export { UseFavorites, FavoritesProvider };

async function getFavoritesFromDB(userID, jwt) {
  console.log("rerun");
  const response = await fetch(
    `${import.meta.env.VITE_FASTAPI_BASE_URL}favorites`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include",
    }
  );
  console.log("userid: ", userID);
  if (!response.ok) throw new Error("Failed to fetch trending movies");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
}

async function addFavoriteToDB(movie, jwt) {
  const response = await fetch(
    `${import.meta.env.VITE_FASTAPI_BASE_URL}favorites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include",
      body: JSON.stringify({ movieName: movie }),
    }
  );
  if (!response.ok) throw new Error("Failed to add movie");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
}

async function removeFavoriteFromDB(movie, jwt) {
  const response = await fetch(
    `${import.meta.env.VITE_FASTAPI_BASE_URL}favorites`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include",
      body: JSON.stringify({ movieName: movie }),
    }
  );
  if (!response.ok) throw new Error("Failed to remove movie");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
}
