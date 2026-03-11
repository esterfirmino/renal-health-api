FROM node:20

WORKDIR /app
RUN npm i -g @nestjs/cli

COPY package*.json ./
RUN npm install 

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
