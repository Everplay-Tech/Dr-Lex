FROM node:20-slim

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
