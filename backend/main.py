import uvicorn
from fastapi import FastAPI, HTTPException, Request, Depends
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

# Combine multiple regex patterns into a single pattern using alternation (|)
origins_regex = r"^(http://localhost.*|http://frontend:.*|https://.*\.run\.app|https://.*\.cloudfunctions\.net)$"

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=origins_regex,
    # allow_origins=["*"],  # Allow all origins for testing
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

# Load environment variables from .env file (if it exists)
# In Docker, environment variables will be passed at runtime instead
if env_path.exists():
    print(f"Loading environment variables from {env_path}")
    load_dotenv(env_path)
else:
    print("No .env file found, using environment variables from system/Docker")

TMDB_BASE_URL = os.getenv("TMDB_BASE_URL")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

if not TMDB_API_KEY:
    raise ValueError("TMDB_API_KEY environment variable is required")

# Appwrite configuration
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.getenv("APPWRITE_PROJECT_ID")
APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID")
APPWRITE_COLLECTION_ID = os.getenv("APPWRITE_COLLECTION_ID")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")

print("Environment variables loaded successfully")


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
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")

client = Client()
client.set_endpoint(APPWRITE_ENDPOINT)
client.set_project(APPWRITE_PROJECT_ID)
client.set_key(APPWRITE_API_KEY)

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


from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.exception import AppwriteException


async def get_current_user_id(request: Request):
    auth_header = request.headers.get("Authorization")

    # for testing purposes
    if not auth_header:
        print("No auth header found, using default test user")
        return "685845f800158229181c"  # Your test user ID

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header"
        )

    jwt = auth_header.split(" ")[1]

    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint("https://fra.cloud.appwrite.io/v1")
        client.set_project(APPWRITE_PROJECT_ID)
        client.set_jwt(jwt)  # Set the JWT for this request

        # Get account service
        account = Account(client)

        # Get user account (this validates the JWT)
        user = account.get()

        return user["$id"]

    except AppwriteException as e:
        print(f"Appwrite validation failed: {e.message}")
        raise HTTPException(status_code=401, detail="Invalid JWT")


class FavoriteMovie(BaseModel):
    id: int
    title: str
    vote_average: float
    poster_path: str
    release_date: str
    original_language: str
    ranking: int


class FavoriteResponse(BaseModel):
    favorites: List[FavoriteMovie]


@app.get("/api/favorites", response_model=FavoriteResponse)
async def get_favorites(request: Request, user_id: str = Depends(get_current_user_id)):
    try:
        result = database.list_documents(
            APPWRITE_DATABASE_ID,
            "685996b7001270f656eb",
            [Query.equal("user_id", user_id)],
        )

        movies = []
        for doc in result["documents"]:
            movie = {
                "id": doc["movie_id"],
                "title": doc["title"],
                "vote_average": doc.get("vote_average", 0),
                "poster_path": doc.get("poster_path", ""),
                "release_date": doc.get("release_date", ""),
                "original_language": doc.get("original_language", "unknown"),
                "ranking": doc.get("ranking", 0),
            }
            movies.append(movie)

        print(f"Found {len(movies)} favorites for user {user_id}")
        return {"favorites": movies}
    except Exception as e:
        print("Error fetching favorites:", e)
    return {"favorites": []}


class FavoriteMoviePost(BaseModel):
    id: int
    title: str
    vote_average: Optional[float] = 0
    poster_path: Optional[str] = ""
    release_date: Optional[str] = ""
    original_language: Optional[str] = "unknown"
    ranking: Optional[int] = 1


class FavoritePostRequestBody(BaseModel):
    movie: FavoriteMoviePost


@app.post("/api/favorites")
async def add_favorite(
    request: Request,
    body: FavoritePostRequestBody,
    user_id: str = Depends(get_current_user_id),
):
    try:
        movie = body.movie  # This is a FavoriteMoviePost object

        existing = database.list_documents(
            APPWRITE_DATABASE_ID,
            "685996b7001270f656eb",
            [Query.equal("user_id", user_id), Query.equal("movie_id", movie.id)],
        )

        if len(existing["documents"]) > 0:
            print("Movie already in favorites")
            return {"message": "Movie already in favorites"}

        new_favorite = {
            "user_id": user_id,
            "movie_id": movie.id,
            "title": movie.title,
            "vote_average": movie.vote_average,
            "poster_path": movie.poster_path,
            "release_date": movie.release_date,
            "original_language": movie.original_language,
            "ranking": movie.ranking,
        }

        created_doc = database.create_document(
            APPWRITE_DATABASE_ID, "685996b7001270f656eb", "unique()", new_favorite
        )

        print(f"Added favorite: {movie.title}")
        return {"message": "Movie added to favorites", "document": created_doc}

    except Exception as e:
        print("Error adding movie:", e)
    return {"error": "Something went wrong"}


class FavoriteMovieDelete(BaseModel):
    id: int


class FavoritePostRequestBody(BaseModel):
    movie: FavoriteMovieDelete


@app.delete("/api/favorites")
async def remove_favorite(
    request: Request,
    body: FavoritePostRequestBody,
    user_id: str = Depends(get_current_user_id),
):
    try:
        movie = body.movie

        # Find the document to delete
        result = database.list_documents(
            APPWRITE_DATABASE_ID,
            "685996b7001270f656eb",
            [Query.equal("user_id", user_id), Query.equal("movie_id", movie.id)],
        )

        if len(result["documents"]) == 0:
            print("Movie not found in favorites")
            return {"message": "Movie not found in favorites"}

        # Delete the document
        document_to_delete = result["documents"][0]
        database.delete_document(
            APPWRITE_DATABASE_ID, "685996b7001270f656eb", document_to_delete["$id"]
        )

        print(f"Removed favorite: {movie.id}")
        return {"message": "Movie removed from favorites"}

    except Exception as e:
        print("Error removing movie:", e)
    return {"error": "Something went wrong"}


if __name__ == "__main__":
    # Cloud Run sets PORT environment variable
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
