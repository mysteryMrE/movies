#!/bin/sh

# Create the runtime configuration 
echo "Creating runtime configuration..."
echo "window.APP_CONFIG = {" > ./dist/env-config.js
echo "  VITE_APPWRITE_ENDPOINT: \"$APPWRITE_ENDPOINT\"," >> ./dist/env-config.js
echo "  VITE_APPWRITE_PROJECT_ID: \"$APPWRITE_PROJECT_ID\"," >> ./dist/env-config.js
echo "  VITE_FASTAPI_BASE_URL: \"$FASTAPI_BASE_URL\"" >> ./dist/env-config.js
echo "};" >> ./dist/env-config.js
echo "Runtime configuration created."
echo $APPWRITE_ENDPOINT
exec serve -s dist -l 8080




gcloud run deploy movie-api-backend --image=europe-central2-docker.pkg.dev/indigo-syntax-465510-c2/first-project/backend:latest --platform=managed --region=europe-central2 --allow-unauthenticated --set-env-vars="TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTc4Yjc2MmFiOTFhM2I0YWI3NTY5NjUzZWE2ODMxNSIsIm5iZiI6MTc1MDA4Njk2My45NjcsInN1YiI6IjY4NTAzNTMzMGVlN2UwYjY2MjM0NGMxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Dop7H0Gwza7cTkAr-NE77YC2IDHkov5K_u8_uhbFGN8,TMDB_BASE_URL=https://api.themoviedb.org/3,APPWRITE_PROJECT_ID=686fe635002d1f28d79d,APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1,ENVIRONMENT=production" --memory=512Mi --cpu=1 --min-instances=0 --max-instances=10


gcloud run deploy movie-app-backend --image europe-west3-docker.pkg.dev/indigo-syntax-465510-c2/movie-project/movie-app-backend:latest --platform managed --region europe-west3 --allow-unauthenticated --port 8080 --cpu=1 --min-instances=0 --max-instances=4 --set-env-vars="ENVIRONMENT=production,TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyOTc4Yjc2MmFiOTFhM2I0YWI3NTY5NjUzZWE2ODMxNSIsIm5iZiI6MTc1MDA4Njk2My45NjcsInN1YiI6IjY4NTAzNTMzMGVlN2UwYjY2MjM0NGMxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Dop7H0Gwza7cTkAr-NE77YC2IDHkov5K_u8_uhbFGN8,TMDB_BASE_URL=https://api.themoviedb.org/3,APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1,APPWRITE_PROJECT_ID=6851780b002c90986037,APPWRITE_DATABASE_ID=6851794d00171ab06504,APPWRITE_COLLECTION_ID=6851875f0010cb723784,APPWRITE_API_KEY=standard_19b1c91d196fcba5ede8c35e731704c24522b736fb50a9e5fbe8a79907a24b81eb96655f0de1e0caff76b0d4229993aa57ae4bd62b955a3c08c62789e7ae302a259e25b649737f9a5968e7b068c398f04fb567db05a45199e63ef27e463251957f08521d147d53a886d2bf4e069176b96d35645863c964b38475d51241aba084"