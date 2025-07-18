# Use a Node.js 18 LTS image as the base for building
FROM node:18-alpine AS builder

# Declare build arguments for environment variables
ARG DATABASE_URL
ARG API_KEY
ARG NEO4J_SCHEME
ARG NEO4J_HOST
ARG NEO4J_PORT
ARG NEO4J_USERNAME
ARG NEO4J_PASSWORD

# Set environment variables from build arguments
ENV DATABASE_URL=$DATABASE_URL
ENV API_KEY=$API_KEY
ENV NEO4J_SCHEME=$NEO4J_SCHEME
ENV NEO4J_HOST=$NEO4J_HOST
ENV NEO4J_PORT=$NEO4J_PORT
ENV NEO4J_USERNAME=$NEO4J_USERNAME
ENV NEO4J_PASSWORD=$NEO4J_PASSWORD

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Use a smaller Node.js image for the production environment
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your NestJS application listens on (e.g., 3000)
EXPOSE 3000

# Command to run the NestJS application
CMD ["node", "dist/main"]
