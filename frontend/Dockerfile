# ----- GIAI ĐOẠN 1: BUILD DEPENDENCIES -----
FROM node:18-alpine AS deps
WORKDIR /app
# Kích hoạt pnpm cho giai đoạn này
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# ----- GIAI ĐOẠN 2: BUILD APPLICATION -----
FROM node:18-alpine AS builder
WORKDIR /app
# Kích hoạt pnpm cho giai đoạn này
RUN corepack enable  # <--- SỬA LỖI: THÊM LẠI DÒNG NÀY
# Sao chép các thư viện đã cài ở bước trước
COPY --from=deps /app/node_modules ./node_modules
# Sao chép code và build ứng dụng
COPY . .
RUN pnpm run build


# ----- GIAI ĐOẠN 3: PRODUCTION RUNNER -----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Kích hoạt pnpm cho giai đoạn này để chạy lệnh "start"
RUN corepack enable  # <--- SỬA LỖI: VÀ THÊM CẢ VÀO ĐÂY

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["pnpm", "start"]