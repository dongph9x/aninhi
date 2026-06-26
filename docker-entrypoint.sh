#!/bin/sh
set -e

# Các thư mục data/ và logs/ thường được bind-mount từ host (VPS) vào container.
# `chown` lúc build image (trong Dockerfile) KHÔNG có tác dụng với bind mount,
# vì nội dung/quyền sở hữu của host sẽ ghi đè lên thư mục trong image lúc container
# start. Container vẫn chạy app bằng user "node" (uid 1000) không phải root, nên nếu
# không chỉnh lại quyền ở đây, bot sẽ gặp lỗi "permission denied" khi ghi log/database
# trên VPS (thư mục host mặc định thường thuộc root hoặc uid khác).
#
# Script này chạy với quyền root (entrypoint), chỉnh quyền sở hữu thư mục mount,
# rồi hạ quyền xuống user "node" bằng su-exec trước khi chạy lệnh thực sự.

mkdir -p /app/data /app/logs

# Đồng bộ Prisma client + áp dụng migration mỗi lần bot khởi động (an toàn, idempotent).
# Chạy bằng root vì node_modules thuộc root (build bằng root) - "node" không có quyền
# ghi lại file client trong node_modules/.prisma. Đây là lệnh cố định trong Dockerfile,
# không phải input người dùng, nên chạy bằng root ở bước này không phải vấn đề bảo mật.
if [ "$1" = "yarn" ]; then
    echo "🔧 Đồng bộ Prisma client và database..."
    npx prisma generate
    npx prisma migrate deploy
fi

# chown sau cùng (sau khi prisma có thể đã tạo database.db mới) để đảm bảo "node"
# luôn là chủ sở hữu thực tế của data/ + logs/ trước khi hạ quyền chạy app.
chown -R node:node /app/data /app/logs

exec su-exec node "$@"
