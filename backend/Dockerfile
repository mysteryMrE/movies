FROM python:3.12-alpine

WORKDIR /app

# Install system dependencies needed for compilation (Alpine version)
RUN apk add --no-cache \
    gcc \
    g++ \
    musl-dev \
    linux-headers

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Use uvicorn command directly for better Cloud Run compatibility
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]