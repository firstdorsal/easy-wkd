FROM node:slim
RUN apt update && apt install gpg -y
WORKDIR /app/
RUN mkdir -p public/.well-known/openpgpkey/hu/
COPY . .
RUN yarn 