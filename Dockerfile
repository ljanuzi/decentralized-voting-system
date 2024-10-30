# multistage build activity
# base image
FROM node:18.20.2-bullseye-slim as base

WORKDIR /app

COPY blockchain/ /app/blockchain
COPY google_auth.json /app/blockchain

# building smart contracts
FROM base as build

WORKDIR /app/blockchain
RUN npm install

RUN node build.js
RUN node build-admin.js

# deploying smart contract
FROM  build as deployment

# not a good practice. Should inject the service key file via CI/CD pipeline
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/blockchain/google_auth.json

# giving some time before ganache starts and then deploy
CMD ["bash", "-c", "\
    retries=0 && \
    until node deployment.js; do \
        if [ $retries -ge 5 ]; then \
            echo 'Failed to connect after 5 retries'; \
            exit 1; \
        fi; \
        echo 'Retrying connection...'; \
        sleep 5; \
        retries=$((retries+1)); \
    done && \
    node deployment-admin.js"]