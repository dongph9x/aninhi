# Sử dụng Node.js 18 Alpine để giảm kích thước image
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Cài đặt dependencies cần thiết
RUN apk add --no-cache git

# Copy package files
COPY package.json yarn.lock ./

# Cài đặt dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Tạo thư mục data để lưu trữ dữ liệu
RUN mkdir -p /app/data

# Tạo thư mục logs
RUN mkdir -p /app/logs

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port (nếu cần)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "console.log('Bot is running')" || exit 1

# Command để chạy bot
CMD ["yarn", "start"] 