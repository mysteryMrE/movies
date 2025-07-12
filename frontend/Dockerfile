# Frontend Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app for production
RUN npm run build

# Install serve to serve the production build
RUN npm install -g serve

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port 8080 (Cloud Run expects this)
EXPOSE 8080

# Start the production server on port 8080
ENTRYPOINT ["./entrypoint.sh"]
