import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import httpx
from dotenv import load_dotenv
from pathlib import Path


class Movie(BaseModel):
    adult: bool
    backdrop_path: str
    genre_ids: List[int]
    id: int
    original_title: str
    original_language: str
    overview: str
    popularity: float
    poster_path: str
    release_date: str
    title: str
    video: bool
    vote_average: float
    vote_count: int


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
print(f"Looking for .env at: {env_path}")
print(f".env file exists: {env_path.exists()}")

# Load environment variables
load_dotenv(env_path)


TMDB_BASE_URL = "https://api.themoviedb.org/3"
API_KEY = os.getenv("TMDB_API_KEY")


headers = {
    "Authorization": f"Bearer {API_KEY}",
    "accept": "application/json",
}


@app.get("/movies", response_model=Movies)
async def get_movies():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{TMDB_BASE_URL}/discover/movie?sort_by=popularity.desc",
                headers=headers,
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
