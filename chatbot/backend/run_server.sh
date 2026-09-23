#!/bin/bash

# Kill any running uvicorn processes
pkill -f 'uvicorn main:app'

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

PORT=${PORT:-8080}
echo "Environment loaded. Starting FastAPI server on port $PORT..."
./venv/bin/uvicorn main:app --reload --reload-exclude "*faiss_cache*" --reload-exclude "*datasets*" --port $PORT 