# Quickstart

This guide runs Postgres in Docker and the API/UI locally (fastest iteration).

## Prereqs

- Docker Desktop
- Node.js + npm

## Start the database (Docker)

From the repo root:

```sh
docker compose up -d db
```

## Run the API locally

From a new terminal:

```sh
cd api
npm install
npm run start:dev
```

Notes:
- Run `npm run start:dev` from inside `api/` so it picks up `api/.env`.
- Root `.env` is for Docker Compose and uses `challenge_db` as the hostname; `api/.env` should use `localhost` when the API runs on your machine.

API runs on `http://localhost:3000`.

## Run the UI locally

From another terminal:

```sh
cd ui
npm install
npm start
```

UI runs on `http://localhost:3001`.

## View the DB (CLI)

Open a `psql` session inside the DB container:

```sh
docker compose exec db psql -U user -d challenge
```

Handy `psql` commands:

```sql
\dt
\d+ accounts
select * from accounts;
\q
```

## Stop the DB

From the repo root:

```sh
docker compose stop db
```
