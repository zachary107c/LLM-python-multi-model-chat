# LLM-integrated-chat project

## Description

BS-LLM-WebUI is a web application with a frontend built using React and Vite, and a backend powered by Django with a Poetry-managed virtual environment.

## Table of Contents

- [BS-LLM-WebUI](#bs-llm-webui)
  - [Description](#description)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup (React with Vite)](#frontend-setup-react-with-vite)
  - [Backend Setup (Django with Poetry)](#backend-setup-django-with-poetry)
  - [Running the Application](#running-the-application)

## Prerequisites

- **[Node.js](https://nodejs.org/en/download)**: Make sure you have Node.js installed to manage frontend dependencies.
- **[Python](https://www.python.org/downloads/)**: Ensure that Python 3.11+ is installed for running the Django backend.
- **[Poetry](https://python-poetry.org/docs/)**: Make sure you have Poetry installed to manage Python dependencies.
- **[Ollama](https://ollama.com/)**: Ensure you have Ollama installed on your machine, or a machine on your local network.
- _Check to ensure each folder (frontend, backend, nginx) have their .env files created. Look at the sample.env files for examples._

### Frontend Environment Variables
- `VITE_APP_BACKEND_API_URL`: The url the frontend will use to access the backend.
  - If locally, `http://127.0.0.1:8000/api/v1/`
  - If with docker compose, `/api/v1/`

### Backend Environment Variables
- `ALLOWED_HOSTS`: The allowed hosts lists for django.
- `OLLAMA_ENDPOINT`: The endpoint to access Ollama running locally.
  - If you are using docker on the same system that is running Ollama, you may need to use `http://host.docker.internal:11434`. Otherwise, it can be the IP address of the device hosting Ollama on your local network.
- `OPENAI_API_KEY`: API Key to interact with OpenAI apis.
- `ANTHROPIC_API_KEY`: API Key to interact with Anthropic apis.
- `GEMINI_API_KEY`: API Key to interact with Google AI apis.
- `AZURE_OPENAI_ENDPOINT`: Endpoint for Azure Open AI resource.
- `AZURE_OPENAI_API_KEY`: API Key for Azure Open AI resource.
- `AZURE_OPENAI_VERSION`: API Version of Azure Open AI resource.

_Azure Open AI is not fully supported yet_

### Root Environment Variables
- `DJANGO_SUPERUSER_USERNAME`: Username of the Django super user.
- `DJANGO_SUPERUSER_PASSWORD`: Password of the Django super user.
- `DJANGO_SUPERUSER_EMAIL`: Email of the Django super user.
- `OLLAMA_ENDPOINT`: The endpoint to access Ollama running locally.
  - If you are using docker on the same system that is running Ollama, you may need to use `http://host.docker.internal:11434`. Otherwise, it can be the IP address of the device hosting Ollama on your local network.
- `VITE_APP_BACKEND_API_URL`: The url the frontend will use to access the backend.
  - If locally, `http://127.0.0.1:8000/api/v1/`
  - If with docker compose, `/api/v1/`

## Quickstart using Docker

```sh
docker compose up --build -d
```

Then the app will be accessible on http://127.0.0.1:8008 (or the ip of the device running the app on your local network)

## Frontend Setup (React with Vite)

### 1. Navigate to the Frontend Directory

```sh
cd frontend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start the Development Server & Tailwind watch

```sh
make run
make tailw
```

This will start the Vite development server, and you should be able to access the frontend at `http://localhost:5173` by default.

## Backend Setup (Django with Poetry)

### 1. Navigate to the Backend Directory

```sh
cd backend
```

### 2. Install Dependencies via Poetry

```sh
poetry install
```

### 3. Apply Database Migrations

```sh
poetry run python manage.py migrate
```

### 4. Create a Superuser (Optional, but recommended)

```sh
poetry run python manage.py createsuperuser
```

### 5. Populate the Models table
```sh
poetry run python manage.py populate_models
```

### 6. Start the Django Development Server

```sh
poetry run python manage.py runserver
```

This will start the Django development server, which will be accessible at `http://localhost:8000` by default.

## Running the Application

To run the application, start both the frontend and backend servers as described above:

1. Start the Vite development server in the frontend directory.
2. Start the Django development server in the backend directory.

The frontend React application will communicate with the Django backend via API calls.

You can then access the site at http://localhost:5173 (or the ip of the device on the local network)

