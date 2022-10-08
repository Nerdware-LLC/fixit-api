# syntax=docker/dockerfile:1
######################################################################
### IMAGE: nerdware/fixit-api
######################################################################
# base

# This build stage sets values and files common to all build stages
# Source image: Nodejs LTS (https://hub.docker.com/_/node)
FROM node:16.17.0 as base

# Expose desired port
EXPOSE 8080

# Explicitly set workdir
WORKDIR /home/node/app

# Copy over files used by all build stages
COPY package*.json apollo.config.cjs ./

#---------------------------------------------------------------------
# builder

# This build stage creates the build/ artifact for "prod" build stage
FROM base as builder

# Copy over the tsconfigs
COPY tsconfig*.json ./

# Copy over src files
COPY src src/

# Install all dependencies
RUN npm ci

# Create build/ for "prod" stage
RUN npm run build

#---------------------------------------------------------------------
# prod

# This build stage creates the final "prod" image for ECS tasks
FROM base as prod

# Add Tini for improved Node process handling https://github.com/krallin/tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Copy over only the files needed in production
COPY --from=builder /home/node/app/build ./build/

# Install only the dependencies necessary to run fixit-api
RUN npm ci --omit=dev

# Set non-root user (this step must be after tini-setup)
USER node

# Run the API directly with node executable
CMD ["node", "build/index.js"]

######################################################################
