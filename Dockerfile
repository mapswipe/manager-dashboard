# syntax=docker/dockerfile:1-labs

# -------------------------- Dev ---------------------------------------
FROM node:22-bookworm AS dev

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash g++ make \
    && git config --global --add safe.directory /code \
    && rm -rf /var/lib/apt/lists/*

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN --mount=type=bind,source=package.json,target=package.json \
    corepack install && corepack enable

WORKDIR /code

# -------------------------- Web app build -----------------------------
FROM dev AS web-app-build

# NOTE: --parents is not yet available in stable syntax, using docker/dockerfile:1-labs
COPY --parents package.json pnpm-lock.yaml patches/ /code/

RUN corepack prepare --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=patches,target=patches \
    pnpm install --frozen-lockfile

COPY . /code/

# Example configuration (These env variables are used to infer the type only)

ENV APP_ENVIRONMENT=STAGE
ENV APP_REST_API_DOMAIN=https://mock.mapswipe.org/api
ENV APP_GRAPHQL_API_DOMAIN=https://mock.mapswipe.org/api

ENV APP_SENTRY_DSN=https://mock.sentry.io/hello123
ENV APP_SENTRY_TRACES_SAMPLE_RATE=0.2
ENV APP_FIREBASE_API_KEY=FIrebaseMockAP1k3Y
ENV APP_FIREBASE_AUTH_DOMAIN=mapswipe-mock.firebaseapp.com
ENV APP_FIREBASE_PROJECT_ID=mapswipe-mock
ENV APP_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099

ENV APP_MAPILLARY_API_KEY="MLY\|1234567890987654321\|abcdef12321fedcba"

RUN WEB_APP_SERVE_ENABLED=true pnpm build

FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="Togglecorp"
LABEL org.opencontainers.image.source="https://github.com/mapswipe/manager-dashboard"

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

RUN echo '{ "files": { "maxSize": 2097152 }, "formatter": { "includes": ["**/*.js", "**/*.html"] } }' > biome.json
