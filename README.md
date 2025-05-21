# Manager Dashboard
A web interface for create and manage
projects, tutorials, groups for the MapSwipe.

## Local Development (Using pnpm, without backen)

```bash
# Start web app
pnpm start

# Build web app
pnpm build

# Typescript check
pnpm typecheck

# Eslint check
pnpm lint

# Check unused files
pnpm check-unused

```

## Local Development (Using Docker, with backend)

We use a `docker-compose.yml` file (located at `./backend/docker-compose.yml`).
To run it, you need to set up a `.env` file.

Create a `.env` file with the following content:

```
# Include the backend services
COMPOSE_FILE=./backend/docker-compose.yml:docker-compose.yml

# Use the same .env file for both backend and web-app
BACKEND_ENV_FILE=../.env
```

> NOTE: `../` refers to the web-app folder, relative to `./backend/docker-compose.yml` (the main Docker Compose file).
