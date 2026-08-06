# syntax=docker/dockerfile:1-labs
# FIXME: remove the above syntax whenever possible

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

# -------------------------- Builder ----------------------------------
FROM dev AS builder

# NOTE: --parents is not yet available in stable syntax, using docker/dockerfile:1-labs
COPY --parents package.json pnpm-lock.yaml patches/ /code/

RUN corepack prepare --activate

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=patches,target=patches \
    pnpm install --frozen-lockfile

COPY . /code/

# -------------------------- Web app build -----------------------------
FROM builder AS web-app-build

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


# NOTE: used for type generation
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=./backend/schema.graphql

RUN pnpm generate:type && WEB_APP_SERVE_ENABLED=true pnpm build

FROM ghcr.io/toggle-corp/web-app-serve:v0.1.2 AS web-app-serve

LABEL maintainer="Togglecorp"
LABEL org.opencontainers.image.source="https://github.com/mapswipe/manager-dashboard"

# NOTE: Used by apply-config.sh
ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/

COPY --from=web-app-build /code/build "$APPLY_CONFIG__SOURCE_DIRECTORY"

# Ship a hardened custom apply-config (grep ^APP_) instead of the base image's
# stock default-app-apply-config.sh. The stock script does not escape sed
# replacement metacharacters, so APP_MAPILLARY_API_KEY (a `MLY|...|...` token)
# broke `sed s|…|…|` and the container exited on startup; and it never resolves
# unfilled markers, so any var not set at runtime leaked the literal
# WEB_APP_SERVE_PLACEHOLDER__* string — a truthy value — into the bundle
# (Sentry initialising with a bogus DSN, Firebase with a bogus API key).
# Our script escapes the metachars, resolves unfilled quoted-JS placeholders to
# `undefined` (falsy), and warns on stderr about every leftover marker.
# See ./web-app-serve/apply-config.sh.
COPY ./web-app-serve/apply-config.sh /web-app-serve/app-apply-config.sh
RUN chmod +x /web-app-serve/app-apply-config.sh
ENV APPLY_CONFIG__APPLY_CONFIG_PATH=/web-app-serve/app-apply-config.sh

# Drop the *.gz twins the build emits (vite-plugin-compression2). apply-config
# substitutes placeholders with sed and cannot rewrite compressed bytes, so these
# would be served as publicly fetchable copies still carrying the raw
# WEB_APP_SERVE_PLACEHOLDER__* markers. Nothing reads them either — this image's
# nginx compresses on the fly (gzip on) rather than serving pre-compressed files
# (no gzip_static).
RUN find "$APPLY_CONFIG__SOURCE_DIRECTORY" -name '*.gz' -delete

RUN echo '{ "files": { "maxSize": 2097152 }, "formatter": { "includes": ["**/*.js", "**/*.html"] } }' > biome.json
