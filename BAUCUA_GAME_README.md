# 🎲 Bầu Cua Tôm Cá Game

## 📋 Tổng Quan

Chức năng Bầu Cua Tôm Cá là một trò chơi dân gian Việt Nam được tích hợp vào bot Discord. Người chơi có thể tạo phòng game và mời người khác tham gia cược.

## 🎮 Cách Sử Dụng

### **Khởi tạo game:**
```
n.baucua
```
hoặc
```
n.bc
```

### **Quy tắc chơi:**
1. **Chủ phòng** tạo game bằng lệnh `n.baucua`
2. Game sẽ tồn tại trong **30 giây** để người khác tham gia cược
3. Mỗi người chỉ được **cược 1 lần** và **1 con vật**
4. **Tỷ lệ thắng:** 1:1 (nếu con vật xuất hiện trên xúc xắc)
5. **Cược tối thiểu:** 100 FishCoin
6. **Tổng cược** không được vượt quá số dư của chủ phòng

## 🐷 6 Con Vật

- 🐷 **Bầu** (Heo)
- 🦀 **Cua** (Crab)  
- 🦐 **Tôm** (Shrimp)
- 🐟 **Cá** (Fish)
- 🐔 **Gà** (Chicken)
- 🦌 **Nai** (Deer)

## 🎯 Cơ Chế Game

### **Xúc xắc:**
- **3 con xúc xắc** được xóc
- Mỗi con xúc xắc có **6 mặt** với 6 con vật
- Kết quả là tổng số lần xuất hiện của mỗi con vật

### **Tính thắng thua:**
- Nếu con vật bạn cược xuất hiện **n lần** trên xúc xắc
- Bạn thắng: **Số tiền cược × n** FishCoin
- Nếu không xuất hiện: **Mất toàn bộ số tiền cược**

### **Ví dụ:**
- Bạn cược 1000 FishCoin vào **🐷 Bầu**
- Kết quả xúc xắc: 🐷 Bầu, 🦀 Cua, 🐷 Bầu
- **Bầu xuất hiện 2 lần** → Bạn thắng: 1000 × 2 = **2000 FishCoin**

## 💰 Tính Năng

### **✅ Đã Implement:**
- ✅ Tạo game với chủ phòng
- ✅ Timer 30 giây
- ✅ UI với buttons cho 6 con vật
- ✅ Validation số dư và cược
- ✅ Tính toán kết quả tự động
- ✅ Cập nhật FishCoin trong database
- ✅ Hiển thị kết quả chi tiết

### **🔒 Bảo Mật:**
- Kiểm tra số dư trước khi cược
- Mỗi người chỉ cược 1 lần
- Tổng cược không vượt quá số dư chủ phòng
- Không thể cược khi game đã kết thúc

## 🎨 UI/UX

### **Game Embed:**
- Hiển thị thông tin chủ phòng
- Số dư chủ phòng
- Tổng cược hiện tại
- Thời gian còn lại
- Danh sách cược gần nhất

### **Kết quả Embed:**
- Kết quả 3 con xúc xắc
- Kết quả từng người chơi
- Kết quả chủ phòng
- Thống kê thắng/thua

## 🚀 Cách Chạy

1. **Restart bot** để load command mới
2. Sử dụng lệnh `n.baucua` trong Discord
3. Nhấn button con vật để cược
4. Chờ 30 giây để xem kết quả

## 📁 Files Đã Tạo

- `src/commands/text/games/baucua.ts` - Main command file
- `BAUCUA_GAME_README.md` - Documentation

## 🎉 Hoàn Thành!

Chức năng Bầu Cua đã được implement đầy đủ theo yêu cầu:
- ✅ Prefix: `n.baucua`
- ✅ Chủ phòng tạo game
- ✅ Timer 30 giây
- ✅ Thông báo cược
- ✅ Validation số dư
- ✅ Tỷ lệ 1:1
- ✅ UI đẹp với buttons
- ✅ Tính toán kết quả tự động
