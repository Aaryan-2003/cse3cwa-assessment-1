FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .

RUN chmod +x /app/entrypoint.sh

# `prisma generate` only reads the schema file, but still requires
# DATABASE_URL to be set; the real value is supplied at container start
# by docker-compose and overrides this placeholder. Generates the client
# for this container's platform (Alpine/musl), which can differ from
# whatever platform it was last generated on locally.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

EXPOSE 4000

CMD ["/bin/sh", "/app/entrypoint.sh"]
