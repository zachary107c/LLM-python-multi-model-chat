FROM python:3.11-slim

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

RUN python manage.py collectstatic --noinput
RUN python manage.py migrate
RUN python manage.py populate_ollama_models
RUN python manage.py populate_openai_models
RUN python manage.py update_fixtures
RUN python manage.py createsuperuser --noinput
RUN python manage.py loaddata tools_fixture.json

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]