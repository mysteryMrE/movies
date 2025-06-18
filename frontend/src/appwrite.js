
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

import { Client, Databases, Query, ID } from "appwrite";

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    //console.log(PROJECT_ID, DATABASE_ID, COLLECTION_ID);
    try{
        const result = await database.listDocuments(
            DATABASE_ID, COLLECTION_ID, [Query.equal('search_term', searchTerm)]
        );
        if (result.documents.length > 0){
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {count: doc.count + 1});
        }
        else{
            await database.createDocument(DATABASE_ID,COLLECTION_ID, ID.unique(),{search_term : searchTerm, count: 1, movie_id : movie.id, poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}` })
        }
        console.log("Search count updated successfully");

    }
    catch (error) {
        console.error("Error:", error);
    }
}


export const getTredingMovies = async () => {
    try{
        const result = await database.listDocuments(
            DATABASE_ID, COLLECTION_ID, [Query.orderDesc('count'), Query.limit(5)]
        );
        return result.documents;
    }catch (error) {
        console.error("Error fetching trending movies:", error);
    }
}