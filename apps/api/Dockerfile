# Stage 1: Base Environment
FROM node:24-bookworm-slim AS base
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/constants/package*.json ./packages/constants/


# Stage 2: Development Environment
FROM base AS development
# Install ALL dependencies (including devDependencies)
RUN npm install

# Copy all source code
COPY . .

# Expose port and run the development server
EXPOSE 3000
CMD ["npm", "run", "dev:api"]


# Stage 3: Builder (Used to compile for production)
FROM development AS builder
RUN npm run build:api


# Stage 4: Production Environment
FROM base AS production
# Set Node to production environment
ENV NODE_ENV=production

# Copy tsconfig files so tsx can resolve aliases
COPY tsconfig.base.json ./
COPY apps/api/tsconfig.json ./apps/api/

# Install only production dependencies for the API and root
RUN npm run install:api:prod

# Copy the built dist output from the builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/constants/dist ./packages/constants/dist
COPY --from=builder /app/packages/constants/src ./packages/constants/src

# Expose the API port
EXPOSE 3000

# Start the API
CMD ["npm", "run", "start:api"]
