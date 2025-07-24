from fastapi.testclient import TestClient
import sys
import os
from unittest.mock import patch, MagicMock, AsyncMock
import httpx
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Mock environment variables BEFORE importing main
mock_env = {
    "TMDB_BASE_URL": "http://mock-tmdb.com/3",
    "TMDB_API_KEY": "mock_tmdb_key_for_test",
    "APPWRITE_ENDPOINT": "http://mock-appwrite.com",
    "APPWRITE_PROJECT_ID": "mock_project_id",
    "APPWRITE_DATABASE_ID": "mock_database_id",
    "APPWRITE_COLLECTION_ID": "mock_collection_id",
    "APPWRITE_API_KEY": "mock_appwrite_api_key",
}

# Patch os.getenv before importing main
with patch(
    "os.getenv", side_effect=lambda key, default=None: mock_env.get(key, default)
):
    from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Movie App API!"}


def test_get_movies_without_search():
    """Test get_movies endpoint without search term (popular movies)"""
    mock_tmdb_response = {
        "page": 1,
        "results": [
            {
                "adult": False,
                "backdrop_path": "/backdrop1.jpg",
                "genre_ids": [28, 12, 878],
                "id": 12345,
                "original_language": "en",
                "original_title": "Test Movie 1",
                "overview": "A test movie overview",
                "popularity": 1234.567,
                "poster_path": "/poster1.jpg",
                "release_date": "2024-01-15",
                "title": "Test Movie 1",
                "video": False,
                "vote_average": 8.5,
                "vote_count": 1000,
            },
            {
                "adult": False,
                "backdrop_path": "/backdrop2.jpg",
                "genre_ids": [35, 10749],
                "id": 67890,
                "original_language": "en",
                "original_title": "Test Movie 2",
                "overview": "Another test movie overview",
                "popularity": 987.654,
                "poster_path": "/poster2.jpg",
                "release_date": "2024-02-20",
                "title": "Test Movie 2",
                "video": False,
                "vote_average": 7.2,
                "vote_count": 500,
            },
        ],
        "total_pages": 100,
        "total_results": 2000,
    }
    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.json.return_value = mock_tmdb_response
        mock_response.raise_for_status.return_value = None

        mock_async_client_instance = AsyncMock()
        mock_async_client_instance.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_async_client_instance

        # Mock the threading and database update to avoid actual database calls
        with patch("threading.Thread") as mock_thread:
            response = client.get("/api/movies")

            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert len(data["results"]) == 2
            assert data["results"][0]["title"] == "Test Movie 1"
            assert data["results"][0]["id"] == 12345
            assert data["results"][1]["title"] == "Test Movie 2"
            assert data["results"][1]["id"] == 67890

            # Verify that search count update was triggered

            assert not mock_thread.called

            # Verify the correct URL was called (search endpoint)
            mock_async_client_instance.get.assert_called_once()
            called_url = mock_async_client_instance.get.call_args[0][0]
            assert "discover/movie" in called_url
            assert "sort_by=popularity.desc" in called_url


def test_get_movies_with_search():
    """Test get_movies endpoint with search term"""
    search_term = "avengers"
    mock_tmdb_response = {
        "page": 1,
        "results": [
            {
                "adult": False,
                "backdrop_path": "/avengers_backdrop.jpg",
                "genre_ids": [28, 12, 878],
                "id": 24428,
                "original_language": "en",
                "original_title": "The Avengers",
                "overview": "Earth's mightiest heroes must come together and learn to fight as a team.",
                "popularity": 2500.123,
                "poster_path": "/avengers_poster.jpg",
                "release_date": "2012-05-04",
                "title": "The Avengers",
                "video": False,
                "vote_average": 7.7,
                "vote_count": 15000,
            }
        ],
        "total_pages": 5,
        "total_results": 100,
    }

    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.json.return_value = mock_tmdb_response
        mock_response.raise_for_status.return_value = None

        mock_async_client_instance = AsyncMock()
        mock_async_client_instance.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_async_client_instance

        # Mock the threading and database update to avoid actual database calls
        with patch("threading.Thread") as mock_thread:
            response = client.get(f"/api/movies?search_term={search_term}")

            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert len(data["results"]) == 1
            assert data["results"][0]["title"] == "The Avengers"
            assert data["results"][0]["id"] == 24428

            # Verify that search count update was triggered

            assert mock_thread.called
            assert search_term in mock_thread.call_args[1]["args"]

            # Verify the correct URL was called (search endpoint)
            mock_async_client_instance.get.assert_called_once()
            called_url = mock_async_client_instance.get.call_args[0][0]
            assert "search/movie" in called_url
            assert f"query={search_term}" in called_url


def test_get_movies_empty_results():
    """Test get_movies endpoint with search that returns no results"""
    search_term = "nonexistentmovie123"
    mock_tmdb_response = {
        "page": 1,
        "results": [],
        "total_pages": 0,
        "total_results": 0,
    }

    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.json.return_value = mock_tmdb_response
        mock_response.raise_for_status.return_value = None

        mock_async_client_instance = AsyncMock()
        mock_async_client_instance.get.return_value = mock_response
        mock_client.return_value.__aenter__.return_value = mock_async_client_instance

        # Mock the threading and database update to avoid actual database calls
        with patch("threading.Thread") as mock_thread:
            response = client.get(f"/api/movies?search_term={search_term}")

            assert response.status_code == 200
            data = response.json()
            assert "results" in data
            assert len(data["results"]) == 0

            # Verify that search count update was triggered

            assert not mock_thread.called

            # Verify the correct URL was called (search endpoint)
            mock_async_client_instance.get.assert_called_once()
            called_url = mock_async_client_instance.get.call_args[0][0]
            assert "search/movie" in called_url
            assert f"query={search_term}" in called_url


def test_get_movies_http_error():
    """Test get_movies endpoint when TMDB API returns an error"""
    with patch("httpx.AsyncClient") as mock_client:
        mock_async_client_instance = AsyncMock()
        mock_async_client_instance.get.side_effect = httpx.HTTPError("API Error")
        mock_client.return_value.__aenter__.return_value = mock_async_client_instance

        response = client.get("/api/movies")

        assert response.status_code == 500
        data = response.json()
        assert "detail" in data

        # Verify that the HTTP call was attempted
        mock_async_client_instance.get.assert_called_once()
