FROM node:22 AS build
WORKDIR /app
COPY package*.json .
RUN apt-get update && apt-get install -y jq
RUN npm install -g typescript
COPY . .
RUN yarn install
RUN yarn build

FROM node:22 AS production
EXPOSE 5000
WORKDIR /app
COPY package*.json .
COPY --from=build /app/packages/ ./packages
CMD ["node", "start"]