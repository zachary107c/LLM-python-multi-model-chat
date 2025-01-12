FROM python:3.11-slim

RUN useradd -u 8877 bsllmwebuibackend

ARG DJANGO_SUPERUSER_USERNAME
ARG DJANGO_SUPERUSER_PASSWORD
ARG DJANGO_SUPERUSER_EMAIL
ARG OLLAMA_ENDPOINT

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-root --no-interaction --no-ansi

EXPOSE 8000

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create directory for SQLite and set permissions before running Django commands
RUN mkdir -p /app/data && \
    chown -R bsllmwebuibackend:bsllmwebuibackend /app && \
    chmod 775 /app/data

RUN python manage.py collectstatic --noinput
RUN python manage.py migrate
RUN python manage.py populate_ollama_models
RUN python manage.py populate_openai_models
RUN python manage.py update_fixtures
RUN python manage.py createsuperuser --noinput
RUN python manage.py loaddata tools_fixture.json

# Ensure proper permissions for the database file and its containing directory
RUN chown -R bsllmwebuibackend:bsllmwebuibackend /app && \
    chmod 775 /app && \
    chmod 664 db.sqlite3

USER bsllmwebuibackend

CMD ["python", "manage.py", "runserver", "0.0.0.0:6969"]