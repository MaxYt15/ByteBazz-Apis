# Use official Node.js image as the base
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies (if any)
RUN if [ -f package.json ]; then npm install; fi

# Copy the rest of the app
COPY . .

# Expose port (default for static server)
EXPOSE 3000

# Install a simple static server
RUN npm install -g serve

# Start static server for the 'public' folder
CMD ["serve", "-s", "public", "-l", "3000"]
