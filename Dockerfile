FROM node:20-bookworm-slim

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY backend ./backend

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app/backend

EXPOSE 8080

CMD ["npm", "start"]
