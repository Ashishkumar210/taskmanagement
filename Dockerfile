# # ============================================================
# # Stage 1: Dependencies
# # ============================================================

# FROM node:24-alpine AS dependencies

# WORKDIR /app

# # Install dependencies using lock file
# COPY package.json package-lock.json ./

# RUN npm ci


# # ============================================================
# # Stage 2: Build / Prisma generation
# # ============================================================

# FROM node:24-alpine AS build

# WORKDIR /app

# COPY --from=dependencies /app/node_modules ./node_modules

# COPY package.json package-lock.json ./

# COPY prisma ./prisma
# COPY prisma.config.ts ./

# # Generate Prisma Client
# RUN npx prisma generate

# # Copy application source
# COPY src ./src


# # ============================================================
# # Stage 3: Production
# # ============================================================

# FROM node:24-alpine AS production

# WORKDIR /app

# ENV NODE_ENV=production

# # Copy package metadata
# COPY package.json package-lock.json ./

# # Install production dependencies only
# RUN npm ci --omit=dev

# # Copy generated Prisma client
# COPY --from=build /app/src/generated ./src/generated

# # Copy Prisma configuration/schema if required at runtime
# COPY --from=build /app/prisma ./prisma
# COPY --from=build /app/prisma.config.ts ./

# # Copy application
# COPY --from=build /app/src ./src

# # Run as non-root user
# USER node

# EXPOSE 4001

# CMD ["node", "-r", "dotenv/config", "src/index.js"]




FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


FROM node:24-alpine AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY package.json package-lock.json ./

COPY prisma ./prisma

COPY prisma.config.ts ./

RUN npx prisma generate

COPY src ./src


FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=build /app/src ./src

COPY --from=build /app/prisma ./prisma

COPY --from=build /app/prisma.config.ts ./

USER node

EXPOSE 4001

CMD [
  "node",
  "-r",
  "dotenv/config",
  "src/index.js"
]