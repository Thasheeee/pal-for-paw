# Use Python 3.12 slim for a smaller, faster build
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies needed for image processing (Pillow/OpenCV)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the root and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything (including the 'backend' folder) into the container
COPY . .

# Move into the backend folder so gunicorn can find server.py
WORKDIR /app/backend

# Hugging Face Spaces uses port 7860
EXPOSE 7860

# Start the Flask app (server.py)
CMD ["gunicorn", "-b", "0.0.0.0:7860", "server:app"]