# I used Node.js 18 alpine (lightweight version) as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better caching
# Docker caches this layer — only re-runs npm install if package.json changes
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Tell Docker this container listens on port 5000
EXPOSE 5000

# Command to start the server
CMD ["node", "server.js"]