FROM python:3.11-slim

RUN useradd -u 8877 bsllmwebuibackend

ARG DJANGO_SUPERUSER_USERNAME
ARG DJANGO_SUPERUSER_PASSWORD
ARG DJANGO_SUPERUSER_EMAIL
ARG OLLAMA_ENDPOINT

WORKDIR /app

# Copy only dependency files first
COPY pyproject.toml poetry.lock ./

# Install dependencies
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy the rest of the application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/data && \
    chown -R bsllmwebuibackend:bsllmwebuibackend /app && \
    chmod 775 /app/data

# Run Django commands
RUN python manage.py collectstatic --noinput && \
    python manage.py migrate && \
    python manage.py populate_ollama_models && \
    python manage.py populate_openai_models && \
    python manage.py populate_anthropic_models && \
    python manage.py populate_google_models && \
    python manage.py update_fixtures && \
    python manage.py createsuperuser --noinput && \
    python manage.py loaddata tools_fixture.json && \
    python manage.py save_tools

# Set final permissions
RUN chown -R bsllmwebuibackend:bsllmwebuibackend /app && \
    chmod 775 /app && \
    chmod 664 db.sqlite3

# Expose port
EXPOSE 8000

USER bsllmwebuibackend

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]