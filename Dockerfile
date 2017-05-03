FROM node:7.9-alpine

# RUN apk add --no-cache openssh-client openssl

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
VOLUME /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]