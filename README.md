## Environment Setup

1. Frontend Setup
   - Copy `.env.local.example` to `.env.local`
   - Fill in your actual TMDB and Appwrite credentials
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Backend Setup
   - Copy `.env.example` to `.env`
   - Add your TMDB API bearer token
   ```bash
   cp backend/.env.example backend/.env
   ```

> Note: Never commit your actual `.env` or `.env.local` files to version control!