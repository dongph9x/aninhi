# 🔧 Clear Data Foreign Key Constraint Fix

## 📋 Vấn Đề

Script `clear-all-data.ts` gặp lỗi **Foreign Key Constraint Violation** khi cố gắng xóa dữ liệu:

```
❌ Error clearing data: PrismaClientKnownRequestError: 
Invalid `prisma.user.deleteMany()` invocation:

Foreign key constraint violated on the foreign key
```

## 🔍 Nguyên Nhân

Lỗi xảy ra do **thứ tự xóa không đúng** trong database. Các bảng con (có foreign key) phải được xóa trước khi xóa bảng cha (bảng được reference).

### **Vấn Đề Cũ:**
```typescript
// ❌ SAI: Xóa users trước khi xóa các bảng con
await prisma.user.deleteMany({});  // Lỗi vì còn foreign key references
await prisma.transaction.deleteMany({});
```

### **Giải Pháp Mới:**
```typescript
// ✅ ĐÚNG: Xóa bảng con trước, bảng cha sau
await prisma.transaction.deleteMany({});  // Xóa trước
await prisma.user.deleteMany({});         // Xóa sau
```

## 🛠️ Thứ Tự Xóa Đúng

### **1. Bảng Con (Foreign Key) - Xóa Trước**
```typescript
// 1. FishFood (references User)
await prisma.fishFood.deleteMany({});

// 2. FishTransaction (references User)
await prisma.fishTransaction.deleteMany({});

// 3. Transaction (references User)
await prisma.transaction.deleteMany({});

// 4. DailyClaim (references User)
await prisma.dailyClaim.deleteMany({});

// 5. GameStats (references User)
await prisma.gameStats.deleteMany({});

// 6. BattleHistory (references User)
await prisma.battleHistory.deleteMany({});

// 7. BreedingHistory (references User)
await prisma.breedingHistory.deleteMany({});

// 8. FishMarket (references Fish)
await prisma.fishMarket.deleteMany({});

// 9. FishPrice (không có foreign key)
await prisma.fishPrice.deleteMany({});

// 10. BattleFishInventoryItem (references BattleFishInventory)
await prisma.battleFishInventoryItem.deleteMany({});

// 11. FishInventoryItem (references FishInventory)
await prisma.fishInventoryItem.deleteMany({});

// 12. InventoryItem (references Inventory)
await prisma.inventoryItem.deleteMany({});

// 13. TournamentMessage (references Tournament)
await prisma.tournamentMessage.deleteMany({});

// 14. TournamentParticipant (references Tournament & User)
await prisma.tournamentParticipant.deleteMany({});

// 15. CaughtFish (references FishingData)
await prisma.caughtFish.deleteMany({});

// 16. FishingRod (references FishingData)
await prisma.fishingRod.deleteMany({});

// 17. FishingBait (references FishingData)
await prisma.fishingBait.deleteMany({});
```

### **2. Bảng Inventory & Fishing Data**
```typescript
// 18. BattleFishInventory (references User)
await prisma.battleFishInventory.deleteMany({});

// 19. FishInventory (references User)
await prisma.fishInventory.deleteMany({});

// 20. Inventory (references User)
await prisma.inventory.deleteMany({});

// 21. FishingData (references User)
await prisma.fishingData.deleteMany({});
```

### **3. Bảng Fish**
```typescript
// 22. Fish (có thể có foreign key từ FishMarket)
await prisma.fish.deleteMany({});
```

### **4. Bảng Moderation**
```typescript
// 23. ModerationLog (không có foreign key)
await prisma.moderationLog.deleteMany({});

// 24. BanRecord (không có foreign key)
await prisma.banRecord.deleteMany({});
```

### **5. Bảng Tournament**
```typescript
// 25. Tournament (không có foreign key)
await prisma.tournament.deleteMany({});
```

### **6. Bảng User (Cuối Cùng)**
```typescript
// 26. User (bảng cha - xóa cuối cùng)
await prisma.user.deleteMany({});
```

### **7. Bảng Không Có Foreign Key**
```typescript
// 27. SystemSettings (không có foreign key)
await prisma.systemSettings.deleteMany({});

// 28. ItemTemplate (không có foreign key)
await prisma.itemTemplate.deleteMany({});
```

## 📊 Kết Quả Test

### **Script Test:**
```bash
npx tsx scripts/test-clear-data-fix.ts
```

### **Kết Quả:**
```
🧪 Testing Clear Data Fix...

1️⃣ Creating test data...
   ✅ Test user created
   ✅ Test transaction created
   ✅ Test fish transaction created
   ✅ Test daily claim created
   ✅ Test fish food created

2️⃣ Checking created data...
   Users: 36
   Transactions: 8
   Fish Transactions: 152
   Daily Claims: 9
   Fish Food: 9

3️⃣ Running clear data script...
🧹 Clearing all data from database...
   ✅ Fish food deleted
   ✅ Fish transactions deleted
   ✅ Transactions deleted
   ✅ Daily claims deleted
   ✅ Game stats deleted
   ✅ Battle history deleted
   ✅ Breeding history deleted
   ✅ Fish market deleted
   ✅ Fish prices deleted
   ✅ Battle fish inventory items deleted
   ✅ Fish inventory items deleted
   ✅ Inventory items deleted
   ✅ Tournament messages deleted
   ✅ Tournament participants deleted
   ✅ Caught fish deleted
   ✅ Fishing rods deleted
   ✅ Fishing baits deleted
   ✅ Battle fish inventory deleted
   ✅ Fish inventory deleted
   ✅ Inventory deleted
   ✅ Fishing data deleted
   ✅ Fish deleted
   ✅ Moderation logs deleted
   ✅ Ban records deleted
   ✅ Tournaments deleted
   ✅ Users deleted
   ✅ System settings deleted
   ✅ Item templates deleted

🎉 All data cleared successfully!

4️⃣ Checking if data was cleared...
   Users: 0 (was 36)
   Transactions: 0 (was 8)
   Fish Transactions: 0 (was 152)
   Daily Claims: 0 (was 9)
   Fish Food: 0 (was 9)

🎉 SUCCESS: All data cleared successfully!
✅ Foreign key constraint issue has been fixed!
```

## 🎯 Lợi Ích

### **Trước Khi Sửa:**
- ❌ **Lỗi Foreign Key Constraint**
- ❌ **Không thể xóa dữ liệu**
- ❌ **Script bị crash**
- ❌ **Phải xóa thủ công từng bảng**

### **Sau Khi Sửa:**
- ✅ **Xóa thành công tất cả dữ liệu**
- ✅ **Không có lỗi foreign key**
- ✅ **Script chạy mượt mà**
- ✅ **Tự động xóa theo thứ tự đúng**
- ✅ **Database sạch hoàn toàn**

## 🔧 Cách Sử Dụng

### **Local Development:**
```bash
npx tsx scripts/clear-all-data.ts
```

### **Docker Environment:**
```bash
./scripts/docker-run-script.sh clear-all-data
```

### **Test Script:**
```bash
npx tsx scripts/test-clear-data-fix.ts
```

## 📝 Lưu Ý Quan Trọng

### **⚠️ Cảnh Báo:**
- **Script này sẽ xóa TẤT CẢ dữ liệu trong database**
- **Không thể hoàn tác sau khi chạy**
- **Chỉ sử dụng trong môi trường development/testing**

### **🔄 Backup Trước Khi Chạy:**
```bash
# Backup database trước khi clear
./scripts/backup-database.sh
```

### **🎯 Khi Nào Sử Dụng:**
- ✅ **Development environment**
- ✅ **Testing fresh start**
- ✅ **Reset database completely**
- ✅ **Debugging data issues**

## 🎉 Kết Luận

**Lỗi Foreign Key Constraint đã được sửa thành công!**

- ✅ **Thứ tự xóa đúng:** Bảng con → Bảng cha
- ✅ **Tất cả bảng được xóa:** 28 bảng
- ✅ **Không có lỗi:** Foreign key constraint resolved
- ✅ **Test passed:** 100% success rate
- ✅ **Script ready:** Có thể sử dụng an toàn

**Script `clear-all-data.ts` giờ đây hoạt động hoàn hảo và có thể xóa toàn bộ database mà không gặp lỗi!** 🎉 