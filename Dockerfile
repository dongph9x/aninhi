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

# Build TypeScript (optional - since we're using tsx)
# RUN yarn build

# Tạo thư mục data để lưu trữ dữ liệu
RUN mkdir -p /app/data

# Expose port (nếu cần)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Command để chạy bot
CMD ["yarn", "start"] 