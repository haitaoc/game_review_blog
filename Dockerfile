FROM node:12.16.1-alpine

# Create app directory
WORKDIR /app

COPY package*.json ./

# Bundle app source
COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

# Command to run the server
CMD ["npm", "start"]