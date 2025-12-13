# Quickstart Commands

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

API runs on `http://localhost:3000`.

## Run the UI locally

From another terminal:

```sh
cd ui
npm install
npm start
```

UI runs on `http://localhost:3001`.

## Run everything in Docker

```sh
docker compose build
docker compose up -d
```

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

## Wipe DB (and other containers):

```sh
docker compose down --remove-orphans --volumes
```
