# 1) Base image: official Node.js slim image
FROM node:23-slim

# 2) Create app directory in the container
WORKDIR /usr/src/app

# 3) Copy package manifests & install dependencies first
#    (this maximizes Docker layer caching)
COPY package*.json ./

RUN npm ci --only=production

# 4) Copy rest of the application code
COPY . .

# 5) Expose the port your app uses
EXPOSE 3000

# 6) Define the command to run your app
CMD ["node", "index.js"]