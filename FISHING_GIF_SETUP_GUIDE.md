# 🎣 Fishing GIF Setup Guide

## 📋 **Hướng Dẫn Sử Dụng File GIF Của Bạn**

### ✅ **File GIF Đã Sẵn Sàng**
- **File:** `assets/fishing/fish-shark.gif`
- **Size:** 174.75 KB
- **Format:** GIF
- **Status:** ✅ Ready to use

## 🚀 **Bước 1: Upload GIF Lên Discord**

### **Cách 1: Upload Trực Tiếp**
1. **Mở Discord** và tạo một channel riêng (hoặc dùng channel test)
2. **Upload file** `fish-shark.gif` vào channel
3. **Click chuột phải** vào GIF sau khi upload
4. **Chọn "Copy Link"** để lấy URL

### **Cách 2: Upload Lên Giphy**
1. **Truy cập:** https://giphy.com/upload
2. **Upload file** `fish-shark.gif`
3. **Copy URL** từ Giphy

### **Cách 3: Upload Lên Imgur**
1. **Truy cập:** https://imgur.com/upload
2. **Upload file** `fish-shark.gif`
3. **Copy URL** từ Imgur

## 🔧 **Bước 2: Cập Nhật Code**

### **File Cần Sửa:** `src/commands/text/ecommerce/fishing.ts`

### **Tìm Đoạn Code:**
```typescript
const animationSteps = [
    {
        text: "🎣 Đang thả mồi...",
        gif: "https://cdn.discordapp.com/attachments/YOUR_CHANNEL_ID/YOUR_MESSAGE_ID/fish-shark.gif" // TODO: Replace with your Discord CDN URL
    },
    // ... other steps
];
```

### **Thay Thế URL:**
```typescript
const animationSteps = [
    {
        text: "🎣 Đang thả mồi...",
        gif: "YOUR_ACTUAL_URL_HERE" // Thay thế bằng URL thật
    },
    {
        text: "🌊 Đang chờ cá cắn câu...",
        gif: "YOUR_ACTUAL_URL_HERE" // Thay thế bằng URL thật
    },
    {
        text: "🐟 Có gì đó đang cắn câu!",
        gif: "YOUR_ACTUAL_URL_HERE" // Thay thế bằng URL thật
    },
    {
        text: "🎣 Đang kéo cá lên...",
        gif: "YOUR_ACTUAL_URL_HERE" // Thay thế bằng URL thật
    }
];
```

## 📝 **Ví Dụ URL Formats**

### **Discord CDN URL:**
```
https://cdn.discordapp.com/attachments/1234567890123456789/1234567890123456789/fish-shark.gif
```

### **Giphy URL:**
```
https://media.giphy.com/media/abc123def456/fish-shark.gif
```

### **Imgur URL:**
```
https://i.imgur.com/abc123def456.gif
```

## 🧪 **Bước 3: Test Animation**

### **Test Command:**
```bash
n.fishing
```

### **Kiểm Tra:**
- ✅ GIF hiển thị trong mỗi bước animation
- ✅ Animation mượt mà (3 giây, 4 bước)
- ✅ Không bị lag hoặc lỗi
- ✅ Fallback hoạt động nếu GIF lỗi

## 🎯 **Bước 4: Tùy Chỉnh (Optional)**

### **Sử Dụng GIF Khác Nhau Cho Từng Bước:**
```typescript
const animationSteps = [
    {
        text: "🎣 Đang thả mồi...",
        gif: "URL_GIF_CASTING"
    },
    {
        text: "🌊 Đang chờ cá cắn câu...",
        gif: "URL_GIF_WATER"
    },
    {
        text: "🐟 Có gì đó đang cắn câu!",
        gif: "URL_GIF_BITING"
    },
    {
        text: "🎣 Đang kéo cá lên...",
        gif: "URL_GIF_REELING"
    }
];
```

### **Sử Dụng Cùng Một GIF Cho Tất Cả:**
```typescript
const fishingGif = "YOUR_FISH_SHARK_GIF_URL";

const animationSteps = [
    {
        text: "🎣 Đang thả mồi...",
        gif: fishingGif
    },
    {
        text: "🌊 Đang chờ cá cắn câu...",
        gif: fishingGif
    },
    {
        text: "🐟 Có gì đó đang cắn câu!",
        gif: fishingGif
    },
    {
        text: "🎣 Đang kéo cá lên...",
        gif: fishingGif
    }
];
```

## ⚠️ **Lưu Ý Quan Trọng**

### **Performance:**
- **File size:** 174.75 KB (✅ Good size)
- **Loading time:** Nên < 2 giây
- **Format:** GIF (✅ Discord hỗ trợ)

### **Fallback System:**
- Nếu GIF không load được, embed vẫn hiển thị bình thường
- Chỉ có text animation, không có GIF
- Không ảnh hưởng đến chức năng câu cá

### **URL Requirements:**
- ✅ HTTPS URL
- ✅ Public accessible
- ✅ Direct link to GIF file
- ❌ Không phải local file path

## 🔍 **Troubleshooting**

### **GIF Không Hiển Thị:**
1. **Kiểm tra URL:** Đảm bảo URL đúng và accessible
2. **Test URL:** Mở URL trong browser
3. **File format:** Đảm bảo là GIF file
4. **File size:** Không quá lớn (> 10MB)

### **Animation Lag:**
1. **Reduce file size:** Compress GIF
2. **Use CDN:** Discord CDN tốt nhất
3. **Check network:** Đảm bảo kết nối ổn định

### **Fallback Không Hoạt Động:**
1. **Check try-catch:** Code có error handling
2. **Test without GIF:** Xóa URL để test fallback
3. **Console logs:** Kiểm tra error messages

## 📊 **Expected Results**

### **Trước Khi Có GIF:**
```
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...
```

### **Sau Khi Có GIF:**
```
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...

[fish-shark.gif animation hiển thị]
```

## 🎉 **Hoàn Thành!**

Sau khi hoàn thành các bước trên:
- ✅ GIF animation sẽ hoạt động trong lệnh `n.fishing`
- ✅ 4 bước animation với GIF của bạn
- ✅ 3 giây tổng cộng
- ✅ Fallback system đảm bảo hoạt động

**Bắt đầu với Bước 1: Upload GIF lên Discord!** 🚀 