FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json .
# RUN npm install --global yarn
RUN yarn install
COPY . .
RUN yarn build

FROM node:22-alpine AS production
EXPOSE 5000
WORKDIR /app
COPY package*.json .
COPY --from=build /app/dist ./
RUN ls -al
CMD ["node", "index.js"]