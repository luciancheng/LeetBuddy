# Use Node.js LTS (Slim version for smaller size)
FROM node:20-slim

# Install git for development
RUN apt-get update && apt-get install -y git

# Set working directory
WORKDIR /app

# Copy package files separately for better caching
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies (only production dependencies)
RUN npm ci --only=production

# Copy application code with correct ownership
COPY --chown=node:node . .

# Expose the backend port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Set a non-root user for security
USER node

# Start the application
CMD ["npm", "start"]
