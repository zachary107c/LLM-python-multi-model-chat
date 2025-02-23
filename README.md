# BS-LLM-WebUI

_Inspired by [nulzo - Ollama WebUI](https://github.com/nulzo/Ollama-WebUI)_

### Landing Page
![image](https://github.com/user-attachments/assets/eaffa769-362c-431d-9cd9-6f04c87c926b)

### Utilize Custom Tools and Analyze Images
![image](https://github.com/user-attachments/assets/4a71253a-a91d-4b3c-898d-ba4b3d1e2237)

### Custom Defined Tools
![image](https://github.com/user-attachments/assets/cd1ae9c6-cdb7-4c88-94f5-8890632d1597)
![image](https://github.com/user-attachments/assets/435ea0d2-6a26-4504-9947-efd3f61c3519)

### Profile
![image](https://github.com/user-attachments/assets/d85299a3-956b-4071-a703-2128f0dcf5f7)

### Auth
![image](https://github.com/user-attachments/assets/ff7362d9-dec5-41a8-af9a-54c3361fad63)
![image](https://github.com/user-attachments/assets/b1b93702-50b4-4704-acc2-c96da9dcbe1f)

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
  - [License](#license)

## Prerequisites

- **Node.js**: Make sure you have Node.js installed to manage frontend dependencies.
- **Python**: Ensure that Python 3.11+ is installed for running the Django backend.
- **Poetry**: Make sure you have Poetry installed to manage Python dependencies.
- **[Ollama](https://ollama.com/)**: Ensure you have Ollama installed on your machine, or a machine on your local network.

## Quickstart using Docker

```sh
docker compose up --build
```

## Frontend Setup (React with Vite)

### 1. Navigate to the Frontend Directory

```sh
cd frontend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Start the Development Server

```sh
npm run dev
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

### 5. Start the Django Development Server

```sh
poetry run python manage.py runserver
```

This will start the Django development server, which will be accessible at `http://localhost:8000` by default.

## Running the Application

To run the application, start both the frontend and backend servers as described above:

1. Start the Vite development server in the frontend directory.
2. Start the Django development server in the backend directory.

The frontend React application will communicate with the Django backend via API calls.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
