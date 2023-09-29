# This Dockerfile uses multi-stage build to customize DEV and PROD images:
# https://docs.docker.com/develop/develop-images/multistage-build/

FROM node:16 AS base

LABEL maintainer="nikolay.borovenskiy@raccoongang.com"
LABEL vendor="Prozori solutions"

# Install latest chrome dev package and fonts to support major
# charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version
# of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*


## It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY ./superset-pdf-report/package.json /app/package.json
COPY ./superset-pdf-report/package-lock.json /app/package-lock.json

FROM base as development_build
RUN npm install -g nodemon && npm install

FROM base as production_build
USER root
RUN npm ci
COPY . /app
