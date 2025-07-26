import pytest
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock, mock_open
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


@pytest.fixture(autouse=True)
def clean_env():
    """Fixture to clean environment variables before and after each test"""
    # Store original environment variables
    original_env = dict(os.environ)

    # Clear relevant environment variables for clean testing
    env_vars_to_clear = [
        "TMDB_BASE_URL",
        "TMDB_API_KEY",
        "APPWRITE_ENDPOINT",
        "APPWRITE_PROJECT_ID",
        "APPWRITE_DATABASE_ID",
        "APPWRITE_COLLECTION_ID",
        "APPWRITE_API_KEY",
    ]
    for var in env_vars_to_clear:
        os.environ.pop(var, None)

    # Remove main module if it exists to force reimport
    if "main" in sys.modules:
        del sys.modules["main"]

    yield

    # Restore original environment variables
    os.environ.clear()
    os.environ.update(original_env)

    # Clean up main module again
    if "main" in sys.modules:
        del sys.modules["main"]


@patch("pathlib.Path.exists")
@patch("builtins.open", new_callable=mock_open)
@patch("dotenv.load_dotenv")
@patch("appwrite.client.Client")
def test_env_file_exists_and_loads_successfully(
    mock_client, mock_load_dotenv, mock_file_open, mock_exists
):
    """Test case when .env file exists and loads successfully"""
    # Mock .env file exists
    mock_exists.return_value = True

    # Mock environment variables that would be loaded from .env
    mock_env_vars = {
        "TMDB_BASE_URL": "test_tmdb_base_url",
        "TMDB_API_KEY": "test_tmdb_api_key_from_env_file",
        "APPWRITE_ENDPOINT": "test_appwrite_endpoint",
        "APPWRITE_PROJECT_ID": "test_project_id",
        "APPWRITE_DATABASE_ID": "test_database_id",
        "APPWRITE_COLLECTION_ID": "test_collection_id",
        "APPWRITE_API_KEY": "test_appwrite_api_key",
    }

    with patch.dict(os.environ, mock_env_vars, clear=False):
        # Import main module which will trigger the environment loading logic
        import main

        # Assertions
        mock_exists.assert_called_once()
        mock_load_dotenv.assert_called_once()

        # Verify that environment variables are correctly loaded
        assert main.TMDB_API_KEY == "test_tmdb_api_key_from_env_file"
        assert main.TMDB_BASE_URL == "test_tmdb_base_url"
        assert main.APPWRITE_ENDPOINT == "test_appwrite_endpoint"
        assert main.APPWRITE_PROJECT_ID == "test_project_id"
        assert main.APPWRITE_DATABASE_ID == "test_database_id"
        assert main.APPWRITE_COLLECTION_ID == "test_collection_id"
        assert main.APPWRITE_API_KEY == "test_appwrite_api_key"


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_no_env_file_but_system_env_vars_exist(mock_load_dotenv, mock_exists):
#     """Test case when no .env file exists but system environment variables are available"""
#     # Mock .env file does not exist
#     mock_exists.return_value = False

#     # Set system environment variables
#     mock_env_vars = {
#         "TMDB_BASE_URL": "https://api.themoviedb.org/3",
#         "TMDB_API_KEY": "test_tmdb_api_key_from_system",
#         "APPWRITE_ENDPOINT": "https://appwrite-system.example.com",
#         "APPWRITE_PROJECT_ID": "system_project_id",
#         "APPWRITE_DATABASE_ID": "system_database_id",
#         "APPWRITE_COLLECTION_ID": "system_collection_id",
#         "APPWRITE_API_KEY": "system_appwrite_api_key",
#     }

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         # Import main module
#         import main

#         # Assertions
#         mock_exists.assert_called_once()
#         mock_load_dotenv.assert_not_called()  # Should not be called when .env doesn't exist

#         # Verify that system environment variables are used
#         assert main.TMDB_API_KEY == "test_tmdb_api_key_from_system"
#         assert main.TMDB_BASE_URL == "https://api.themoviedb.org/3"
#         assert main.APPWRITE_ENDPOINT == "https://appwrite-system.example.com"
#         assert main.APPWRITE_PROJECT_ID == "system_project_id"
#         assert main.APPWRITE_DATABASE_ID == "system_database_id"
#         assert main.APPWRITE_COLLECTION_ID == "system_collection_id"
#         assert main.APPWRITE_API_KEY == "system_appwrite_api_key"


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_no_env_file_and_no_system_env_vars_raises_error(mock_load_dotenv, mock_exists):
#     """Test case when neither .env file nor system environment variables exist"""
#     # Mock .env file does not exist
#     mock_exists.return_value = False

#     # Don't set any environment variables (they should be cleared in fixture)

#     # Import should raise ValueError due to missing TMDB_API_KEY
#     with pytest.raises(
#         ValueError, match="TMDB_API_KEY environment variable is required"
#     ):
#         import main

#     # Assertions
#     mock_exists.assert_called_once()
#     mock_load_dotenv.assert_not_called()


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_env_file_exists_but_missing_required_var_raises_error(
#     mock_load_dotenv, mock_exists
# ):
#     """Test case when .env file exists but is missing required TMDB_API_KEY"""
#     # Mock .env file exists
#     mock_exists.return_value = True

#     # Set some environment variables but not TMDB_API_KEY
#     mock_env_vars = {
#         "TMDB_BASE_URL": "https://api.themoviedb.org/3",
#         "APPWRITE_ENDPOINT": "https://appwrite.example.com",
#         # TMDB_API_KEY is intentionally missing
#     }

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         # Import should raise ValueError due to missing TMDB_API_KEY
#         with pytest.raises(
#             ValueError, match="TMDB_API_KEY environment variable is required"
#         ):
#             import main

#         # Assertions
#         mock_exists.assert_called_once()
#         mock_load_dotenv.assert_called_once()


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_partial_env_vars_loaded_successfully(mock_load_dotenv, mock_exists):
#     """Test case when only some environment variables are set (optional ones can be None)"""
#     # Mock .env file exists
#     mock_exists.return_value = True

#     # Set only required TMDB_API_KEY and some others
#     mock_env_vars = {
#         "TMDB_API_KEY": "test_tmdb_api_key_minimal",
#         "APPWRITE_PROJECT_ID": "test_project_id",
#         # Other variables will be None/missing
#     }

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         # Import main module
#         import main

#         # Assertions
#         mock_exists.assert_called_once()
#         mock_load_dotenv.assert_called_once()

#         # Verify that required variable is loaded
#         assert main.TMDB_API_KEY == "test_tmdb_api_key_minimal"
#         assert main.APPWRITE_PROJECT_ID == "test_project_id"

#         # Verify that missing variables are None
#         assert main.TMDB_BASE_URL is None
#         assert main.APPWRITE_ENDPOINT is None
#         assert main.APPWRITE_DATABASE_ID is None
#         assert main.APPWRITE_COLLECTION_ID is None
#         assert main.APPWRITE_API_KEY is None


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv", side_effect=Exception("Failed to load .env"))
# def test_env_file_exists_but_load_fails(mock_load_dotenv, mock_exists):
#     """Test case when .env file exists but load_dotenv fails"""
#     # Mock .env file exists
#     mock_exists.return_value = True

#     # Set system environment variables as fallback
#     mock_env_vars = {
#         "TMDB_API_KEY": "fallback_tmdb_api_key",
#     }

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         # Import should still work if system env vars are available
#         # (depends on your error handling - this test assumes load_dotenv failure doesn't stop execution)
#         try:
#             import main

#             # If import succeeds, verify fallback to system env vars
#             assert main.TMDB_API_KEY == "fallback_tmdb_api_key"
#         except Exception as e:
#             # If your code propagates the load_dotenv exception, verify it
#             assert "Failed to load .env" in str(e)

#         # Assertions
#         mock_exists.assert_called_once()
#         mock_load_dotenv.assert_called_once()


# @patch("pathlib.Path.exists")
# @patch("builtins.print")  # Mock print to verify logging messages
# @patch("main.load_dotenv")
# def test_logging_messages_with_env_file(mock_load_dotenv, mock_print, mock_exists):
#     """Test that correct logging messages are printed when .env file exists"""
#     mock_exists.return_value = True
#     mock_env_vars = {"TMDB_API_KEY": "test_key"}

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         import main

#         # Check that correct print statements were called
#         print_calls = [call[0][0] for call in mock_print.call_args_list]
#         assert any("Loading environment variables from" in call for call in print_calls)


# @patch("pathlib.Path.exists")
# @patch("builtins.print")  # Mock print to verify logging messages
# @patch("main.load_dotenv")
# def test_logging_messages_without_env_file(mock_load_dotenv, mock_print, mock_exists):
#     """Test that correct logging messages are printed when .env file doesn't exist"""
#     mock_exists.return_value = False
#     mock_env_vars = {"TMDB_API_KEY": "test_key"}

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         import main

#         # Check that correct print statements were called
#         print_calls = [call[0][0] for call in mock_print.call_args_list]
#         assert any("No .env file found" in call for call in print_calls)


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_api_works_with_mocked_env_vars(mock_load_dotenv, mock_exists):
#     """Integration test that the FastAPI application works correctly with mocked environment variables"""
#     mock_exists.return_value = True

#     mock_env_vars = {
#         "TMDB_BASE_URL": "http://mock-tmdb.com/3",
#         "TMDB_API_KEY": "mock_tmdb_key_for_integration_test",
#         "APPWRITE_ENDPOINT": "http://mock-appwrite.com",
#         "APPWRITE_PROJECT_ID": "mock_project_id",
#         "APPWRITE_DATABASE_ID": "mock_database_id",
#         "APPWRITE_COLLECTION_ID": "mock_collection_id",
#         "APPWRITE_API_KEY": "mock_appwrite_api_key",
#     }

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         # Import and create test client
#         import main

#         client = TestClient(main.app)

#         # Test that the root endpoint works
#         response = client.get("/")
#         assert response.status_code == 200
#         assert response.json() == {"message": "Welcome to the Movie App API!"}

#         # Verify environment variables are correctly loaded in the application
#         assert main.TMDB_API_KEY == "mock_tmdb_key_for_integration_test"
#         assert main.TMDB_BASE_URL == "http://mock-tmdb.com/3"


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_docker_deployment_scenario(mock_load_dotenv, mock_exists):
#     """Test Docker deployment scenario where no .env file exists but all env vars are provided"""
#     # Mock no .env file (typical Docker scenario)
#     mock_exists.return_value = False

#     # Docker environment variables
#     docker_env_vars = {
#         "TMDB_BASE_URL": "https://api.themoviedb.org/3",
#         "TMDB_API_KEY": "docker_tmdb_api_key",
#         "APPWRITE_ENDPOINT": "https://docker-appwrite.example.com",
#         "APPWRITE_PROJECT_ID": "docker_project_id",
#         "APPWRITE_DATABASE_ID": "docker_database_id",
#         "APPWRITE_COLLECTION_ID": "docker_collection_id",
#         "APPWRITE_API_KEY": "docker_appwrite_api_key",
#     }

#     with patch.dict(os.environ, docker_env_vars, clear=False):
#         import main

#         # Verify no attempt to load .env file
#         mock_load_dotenv.assert_not_called()

#         # Verify all Docker environment variables are loaded
#         assert main.TMDB_API_KEY == "docker_tmdb_api_key"
#         assert main.TMDB_BASE_URL == "https://api.themoviedb.org/3"
#         assert main.APPWRITE_ENDPOINT == "https://docker-appwrite.example.com"
#         assert main.APPWRITE_PROJECT_ID == "docker_project_id"
#         assert main.APPWRITE_DATABASE_ID == "docker_database_id"
#         assert main.APPWRITE_COLLECTION_ID == "docker_collection_id"
#         assert main.APPWRITE_API_KEY == "docker_appwrite_api_key"


# @patch("pathlib.Path.exists")
# @patch("main.load_dotenv")
# def test_env_vars_with_none_values(mock_load_dotenv, mock_exists):
#     """Test when some environment variables explicitly return None"""
#     mock_exists.return_value = False

#     # Only set required variable
#     mock_env_vars = {"TMDB_API_KEY": "test_api_key"}

#     with patch.dict(os.environ, mock_env_vars, clear=False):
#         import main

#         # Required variable should be set
#         assert main.TMDB_API_KEY == "test_api_key"

#         # Optional variables should be None
#         assert main.TMDB_BASE_URL is None
#         assert main.APPWRITE_ENDPOINT is None
#         assert main.APPWRITE_PROJECT_ID is None
#         assert main.APPWRITE_DATABASE_ID is None
#         assert main.APPWRITE_COLLECTION_ID is None
#         assert main.APPWRITE_API_KEY is None
