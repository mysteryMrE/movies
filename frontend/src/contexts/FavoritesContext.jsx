import { createContext, useContext } from "react";
//import { addFavoriteToDB, removeFavoriteFromDB, getFavoritesFromDB } from "../appwrite"; // implement getFavoritesFromDB
import { UseAuth } from "./AuthContext"; // to get the current user
import { useQuery } from "@tanstack/react-query";
//import Spinner from "../components/Spinner";
import {config} from "../config";

const FavoritesContext = createContext();

const VITE_FASTAPI_BASE_URL = config.fastapiBaseUrl;

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
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
    refetchIntervalInBackground: false
  });

  const addFavorite = async (movie) => {
    const response = await addFavoriteToDB(movie, jwt);
    console.log(response);
    refetch();
  };

  const removeFavorite = async (movie) => {
    const response = await removeFavoriteFromDB(movie, jwt).then((res) => console.log(res));
    refetch();
  };

  const isFavorite = (movie) => {return favorites.some( m => {return m.id === movie.id})};

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
      {/*isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        children
      )*/}
      {children}
    </FavoritesContext.Provider>
  );
};

const UseFavorites = () => useContext(FavoritesContext);

export { UseFavorites, FavoritesProvider };

async function getFavoritesFromDB(userID, jwt) {
  const response = await fetch(
    `${VITE_FASTAPI_BASE_URL}/api/favorites`,
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
  console.log("new data: ", data["favorites"]);
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  console.log("hello ",data)
  return data["favorites"];
}

async function addFavoriteToDB(movie, jwt) {
  const response = await fetch(
    `${VITE_FASTAPI_BASE_URL}/api/favorites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include",
      body: JSON.stringify({ movie: movie }),
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
    `${VITE_FASTAPI_BASE_URL}/api/favorites`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      credentials: "include",
      body: JSON.stringify({ movie: movie }),
    }
  );
  if (!response.ok) throw new Error("Failed to remove movie");
  const data = await response.json();
  if (data.Response === "False") {
    throw new Error(data.Error || "Failed to format json.");
  }
  return data;
}
