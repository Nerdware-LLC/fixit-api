# syntax=docker/dockerfile:1
###############################################################################
# IMAGE: nerdware/fixit-api
#
# This Dockerfile is used to create a production image for the Fixit API which
# is ultimately deployed to AWS ECS. Starting from an official NodeJS LTS image,
# the image is built in three stages:
#     1. base:     sets common values used by all build stages
#     2. builder:  creates the dist/ build artifact for "prod" build stage
#     3. prod:     creates the final "prod" image for ECS tasks
#
# After being uploaded to the AWS ECR image repo by the relevant GitHub Action,
# the image is scanned for conformance with relevant CIS benchmarks and other
# security standards. Once all checks pass, the image is deployed to AWS ECS.
###############################################################################
# STAGE: base

# Source image: NodeJS v20 LTS (https://hub.docker.com/_/node)
FROM node:20.11.0 as base

# Expose desired port
EXPOSE 80

# Explicitly set workdir
WORKDIR /home/node/app

#------------------------------------------------------------------------------
# STAGE: builder

# This build stage creates the dist build artifact for "prod" build stage
FROM base as builder

# Copy over files needed to create the dist build
COPY package*.json tsconfig*.json? npm-shrinkwrap.json? .swcrc ./

# Install all dependencies (dev deps are needed to create the dist build)
RUN npm ci --include=dev

# Copy over src files (this is done after `npm ci` to take advantage of caching)
COPY src src/

# Create dist/ for "prod" stage and remove dev dependencies
RUN npm run build && npm prune --production

#------------------------------------------------------------------------------
# STAGE: prod

# This build stage creates the final "prod" image for ECS tasks
FROM base as prod

# Add Tini for improved Node process handling https://github.com/krallin/tini
ENV TINI_VERSION=v0.19.0
RUN curl -L https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini -o /tini \
  && chmod +x /tini \
  && echo "Tini downloaded successfully" \
  && apt-get purge -y --auto-remove curl \
  && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/tini", "--"]

# Copy over only the dist files needed in production
COPY --from=builder /home/node/app/dist ./dist/

# Copy over only the pruned node_modules from builder stage
COPY --from=builder /home/node/app/node_modules ./node_modules/

# Set non-root user (this step must be after tini-setup)
USER node

# Set node opts to (1) enable ESM, (2) disable fs r/w, and (3) suppress warnings
# Docs: https://nodejs.org/docs/latest-v20.x/api/cli.html
ENV NODE_OPTIONS='--experimental-default-type=module --experimental-permission --no-warnings'

# Run the API directly with node executable
CMD ["node", "dist/index.js"]

###############################################################################
