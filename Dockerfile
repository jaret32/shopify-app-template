FROM node:18-alpine as backend
WORKDIR /app
COPY web .
RUN npm ci
RUN npm run build


FROM node:18-alpine as frontend
ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY $SHOPIFY_API_KEY
WORKDIR /app
COPY web .
WORKDIR /app/frontend
RUN npm ci
RUN npm run build


FROM node:18-alpine
ENV NODE_ENV=production
EXPOSE 8081
WORKDIR /app
COPY --from=backend /app/dist /app/dist
COPY --from=frontend /app/frontend/dist /app/frontend/dist
COPY web/package*.json ./
RUN npm ci
COPY --from=backend /app/node_modules/.prisma/client /app/node_modules/.prisma/client
CMD ["npm", "run", "serve"]
