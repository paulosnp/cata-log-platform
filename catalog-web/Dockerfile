FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# A chave pública do Stream Chat é embebida no bundle pelo Vite no build time.
# Recebe via build arg do docker-compose e injeta como env var para o Vite.
ARG VITE_STREAM_CHAT_API_KEY
ENV VITE_STREAM_CHAT_API_KEY=${VITE_STREAM_CHAT_API_KEY}

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
