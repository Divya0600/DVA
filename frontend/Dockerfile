# Use an official Node runtime as the base image
FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Make port 3000 available
EXPOSE 3000

# Start the application
CMD ["npm", "start"]