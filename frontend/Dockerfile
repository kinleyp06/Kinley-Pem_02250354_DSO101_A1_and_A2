# frontend/Dockerfile
# Multi-stage build: stage 1 builds, stage 2 runs (keeps image small)

# Stage 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the Next.js production bundle
RUN npm run build

# Stage 2: Run the built app
FROM node:18-alpine AS runner

WORKDIR /app

# Only copy what's needed to run the app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Tell Docker this container listens on port 3000
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]