FROM node:slim
RUN apt update && apt install gpg -y
WORKDIR /app/
RUN mkdir -p public/.well-known/openpgpkey/hu/; touch public/.well-known/openpgpkey/policy
COPY . .
RUN yarn 