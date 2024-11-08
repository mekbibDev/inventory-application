FROM node:20.18.0-bullseye

EXPOSE 3000

ENV port=3000

WORKDIR /usr/src/app

COPY . .

RUN ["yarn","install"]

CMD [ "yarn","start" ]