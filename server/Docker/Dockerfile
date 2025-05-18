FROM ubuntu:latest

# Set a default value for the environment variable
ARG ENV_TYPE=js

# Install packages based on ENV_TYPE
RUN if [ "$ENV_TYPE" = "c" ]; then \
        echo "Installing GCC for C environment" && \
        apt update && apt install -y gcc; \
    elif [ "$ENV_TYPE" = "cpp" ]; then \
        echo "Installing G++ for C++ environment" && \
        apt update && apt install -y g++; \
    elif [ "$ENV_TYPE" = "js" ]; then \
        echo "Installing Node.js for JS environment" && \
        apt update && apt install -y nodejs npm; \
    else \
        echo "Unknown environment type. Exiting..." && exit 1; \
    fi


RUN apt install bash
RUN ln -sf /bin/bash /bin/sh

COPY index.js index.js
COPY package.json package.json
RUN npm install

WORKDIR /docker
RUN mkdir /user

EXPOSE 3000

CMD ["npm", "run", "dev"]
