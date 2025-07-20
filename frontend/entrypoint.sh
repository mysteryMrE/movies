#!/bin/sh

# Create the runtime configuration 
echo "Creating runtime configuration..."
echo "window.APP_CONFIG = {" > ./dist/env-config.js
echo "  VITE_APPWRITE_ENDPOINT: \"$APPWRITE_ENDPOINT\"," >> ./dist/env-config.js
echo "  VITE_APPWRITE_PROJECT_ID: \"$APPWRITE_PROJECT_ID\"," >> ./dist/env-config.js
echo "  VITE_FASTAPI_BASE_URL: \"$FASTAPI_BASE_URL\"," >> ./dist/env-config.js
echo "  VITE_FASTAPI_BASE_SOCKET: \"$FASTAPI_BASE_SOCKET\"" >> ./dist/env-config.js
echo "};" >> ./dist/env-config.js
echo "Runtime configuration created."
echo $APPWRITE_ENDPOINT
exec serve -s dist -l 8080