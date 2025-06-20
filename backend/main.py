import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import httpx
from dotenv import load_dotenv
from pathlib import Path
import urllib.parse as urlparse
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
import json
import threading


class Movie(BaseModel):
    adult: Optional[bool] = None
    backdrop_path: Optional[str] = None
    genre_ids: Optional[List[int]] = None
    id: Optional[int] = None
    original_title: Optional[str] = None
    original_language: Optional[str] = None
    overview: Optional[str] = None
    popularity: Optional[float] = None
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    title: Optional[str] = None
    video: Optional[bool] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None


class Movies(BaseModel):
    results: List[Movie]


# TODO: replace appwrite.js

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_db = {"fruits": []}


class Fruit(BaseModel):
    name: str


class Fruits(BaseModel):
    fruits: List[Fruit]


@app.get("/fruits", response_model=Fruits)
def get_fruits():
    return Fruits(fruits=memory_db["fruits"])


@app.post("/fruits")
def add_fruit(fruit: Fruit, response_model=Fruit):
    memory_db["fruits"].append(fruit)
    return fruit


BASE_DIR = Path(__file__).resolve().parent
print(f"Base directory: {BASE_DIR}")

# Explicitly point to .env file
env_path = BASE_DIR / ".env"

# Load environment variables
load_dotenv(env_path)


TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")


headers = {
    "Authorization": f"Bearer {TMDB_API_KEY}",
    "accept": "application/json",
}


@app.get("/api/movies", response_model=Movies)
async def get_movies(search_term: str = None):
    try:
        URL = None
        if search_term:
            URL = f"{TMDB_BASE_URL}/search/movie?query={urlparse.quote(search_term)}"
        else:
            URL = f"{TMDB_BASE_URL}/discover/movie?sort_by=popularity.desc"
        movies = None
        async with httpx.AsyncClient() as client:
            response = await client.get(
                URL,
                headers=headers,
            )
            response.raise_for_status()
            movies = response.json()
        if len(movies["results"]) > 0 and search_term is not None:
            print(f"Updating search count for: {search_term}")
            threading.Thread(
                target=update_search_count, args=(search_term, movies["results"][0])
            ).start()
        return movies
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=str(e))


APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
APPWRITE_COLLECTION_ID = os.getenv("APPWRITE_COLLECTION_ID")

client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)

database = Databases(client)


def update_search_count(search_term: str, movie: Movie):
    try:
        result = database.list_documents(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            [Query.equal("search_term", search_term)],
        )
        documents = result["documents"]
        if len(documents) > 0:
            doc = documents[0]
            database.update_document(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID,
                doc["$id"],
                {"count": doc["count"] + 1},
            )
        else:
            poster_url = (
                f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
                if movie.get("poster_path")
                else "/no-movie.png"
            )
            database.create_document(
                APPWRITE_DATABASE_ID,
                APPWRITE_COLLECTION_ID,
                "unique()",  # Use "unique()" for unique ID
                {
                    "search_term": search_term,
                    "count": 1,
                    "movie_id": movie["id"],
                    "poster_url": poster_url,
                    "movie_json": json.dumps(movie),
                },
            )
        print("Search count updated successfully")
    except Exception as e:
        print("Error updating search count:", e)


# TODO: response_model
@app.get("/api/movies/trending")
def get_trending_movies():
    try:
        result = database.list_documents(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            [Query.order_desc("count"), Query.limit(5)],
        )
        movies = result["documents"]
        return movies
    except Exception as e:
        print("Error fetching trending movies:", e)
        raise HTTPException(status_code=500, detail="Error fetching trending movies")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
