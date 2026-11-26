# Salut! — Railway / istalgan Docker hosting uchun.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
ENV NODE_ENV=production NODE_NO_WARNINGS=1 PORT=8787 SALUT_DATA_DIR=/data
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src/engine/voice/stt-result.ts ./src/engine/voice/stt-result.ts
COPY --from=build /app/src/shared ./src/shared
RUN mkdir -p /data
EXPOSE 8787
CMD ["node", "server/main.ts"]
