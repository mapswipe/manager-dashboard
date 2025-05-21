# -------------------------- Dev ---------------------------------------

FROM node:20-bookworm AS dev

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

# -------------------------- Builder ---------------------------------------

FROM dev AS builder

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=patches,target=patches \
    pnpm install --frozen-lockfile

COPY . /code/

# -------------------------- Nginx - Builder --------------------------------

FROM builder AS nginx-build

ENV APP_ENVIRONMENT_LOOSE_VALIDATION=true
ENV APP_ENVIRONMENT=APP_ENVIRONMENT_PLACEHOLDER
ENV APP_CSRF_TOKEN_KEY=APP_CSRF_TOKEN_KEY_PLACEHOLDER

ENV APP_GRAPHQL_API_ENDPOINT=APP_GRAPHQL_API_ENDPOINT_PLACEHOLDER
ENV APP_GRAPHQL_CODEGEN_ENDPOINT=APP_GRAPHQL_CODEGEN_ENDPOINT_PLACEHOLDER

ENV APP_SENTRY_DSN=APP_SENTRY_DSN_PLACEHOLDER
ENV APP_SENTRY_TRACES_SAMPLE_RATE=APP_SENTRY_TRACES_SAMPLE_RATE_PLACEHOLDER

ENV APP_BING_API_KEY=APP_BING_API_KEY_PLACEHOLDER
ENV APP_MAPBOX_API_KEY=APP_MAPBOX_API_KEY_PLACEHOLDER
ENV APP_MAXAR_PREMIUM_API_KEY=APP_MAXAR_PREMIUM_API_KEY_PLACEHOLDER
ENV APP_MAXAR_STANDARD_API_KEY=APP_MAXAR_STANDARD_API_KEY_PLACEHOLDER

RUN --mount=type=cache,id=pnpm,target=/pnpm/store env > .env && pnpm build

# ---------------------------------------------------------------------------

FROM nginx:1 AS nginx-serve

LABEL maintainer="Togglecorp"
LABEL org.opencontainers.image.source="github.com/mapswipe/manager-dashboard"

COPY ./nginx-serve/apply-config.sh /docker-entrypoint.d/
COPY ./nginx-serve/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=nginx-build /code/build /code/build

ENV APPLY_CONFIG__SOURCE_DIRECTORY=/code/build/
ENV APPLY_CONFIG__DESTINATION_DIRECTORY=/usr/share/nginx/html/
ENV APPLY_CONFIG__OVERWRITE_DESTINATION=true
