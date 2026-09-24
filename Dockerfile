# ------------------- Stage 1: Build Stage ------------------------------
FROM node:20-alpine AS frontend-builder

# Set the working directory to /app
WORKDIR /build

# Copy the package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code
COPY vite.config.js ./
COPY vite.config.js ./
COPY eslint.config.js ./
COPY public public/
COPY service service/
COPY index.html ./
COPY src src/

# ------------------- Stage 2: Final Stage ------------------------------
FROM node:20-alpine AS production
# FROM node:20-slim
# Set the working directory to /app
WORKDIR /app

# Copy built assets and dependencies from frontend-builder stage
COPY --from=frontend-builder /build .

# Copy the .env.sample file to .env.local
# COPY .env.docker .env.local

# Expose port 5173 for the Node.js application
EXPOSE 5173

# Define the default command to run the application in development mode
# CMD ["npm", "run", "dev"]
CMD ["npm", "run", "dev", "--", "--host"]
