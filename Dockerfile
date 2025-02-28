FROM node:17-buster-slim AS dev

LABEL maintainer="togglecorp info@togglecorp.com"

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        git bash python3 g++ make

WORKDIR /code

FROM dev AS full-client

COPY ./package.json ./yarn.lock /code/
RUN yarn install --frozen-lockfile

COPY . /code/
