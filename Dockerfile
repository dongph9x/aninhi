# Node 22 LTS - bản trước (18) đã hết hỗ trợ bảo mật
FROM node:22-alpine

WORKDIR /app

# openssl + libc6-compat: bắt buộc để Prisma query engine chạy được trên Alpine (musl).
# su-exec: hạ quyền từ root xuống user "node" trong entrypoint (xem docker-entrypoint.sh).
# git: một số package trong yarn.lock cần khi install.
RUN apk add --no-cache openssl libc6-compat su-exec git

ENV NODE_ENV=production \
    HUSKY=0

# Cài dependencies trước, tách layer để cache khi chỉ sửa source code
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true --ignore-scripts

# Generate Prisma client (cần schema, tách riêng khỏi COPY source để tận dụng cache)
COPY prisma ./prisma
RUN npx prisma generate

# Copy phần còn lại của source code
COPY src ./src
COPY assets ./assets
COPY scripts ./scripts
COPY tsconfig.json tsx.config.json ./

# Tạo sẵn thư mục mount; quyền thực tế do docker-entrypoint.sh chỉnh lại mỗi lần
# container start, vì bind mount từ host (VPS) sẽ ghi đè quyền set ở build time.
RUN mkdir -p /app/data /app/logs

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Healthcheck kiểm tra thật: container phải còn ghi được vào data/ (SQLite) và logs/.
# Đây là điểm hay gãy nhất khi deploy lên VPS (quyền thư mục mount sai).
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD su-exec node sh -c "test -w /app/data && test -w /app/logs" || exit 1

# Không set USER ở đây - phải giữ root để entrypoint chown được thư mục mount,
# sau đó entrypoint tự hạ quyền xuống "node" bằng su-exec trước khi chạy app.
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start"]
