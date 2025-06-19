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
API_KEY = os.getenv("TMDB_API_KEY")


headers = {
    "Authorization": f"Bearer {API_KEY}",
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
        async with httpx.AsyncClient() as client:
            response = await client.get(
                URL,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
