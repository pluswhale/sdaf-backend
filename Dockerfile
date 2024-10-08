FROM node:22
WORKDIR /app
COPY package*.json .
RUN apt-get update && apt-get install -y jq
RUN npm install -g typescript
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 5000
WORKDIR /app/packages/bot
CMD ["npm", "start"]