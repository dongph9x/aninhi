# 🎮 Hệ Thống UI Đấu Cá (Battle Fish UI)

## 📋 Tổng Quan

Hệ thống UI đấu cá cung cấp giao diện trực quan và dễ sử dụng để quản lý cá đấu, thay thế cho các lệnh text truyền thống. Người dùng có thể tương tác với các nút và dropdown để thực hiện các thao tác một cách thuận tiện.

## 🎯 Tính Năng Chính

### 1. **Dropdown Chọn Cá**
- **Cá trong túi đấu**: Hiển thị với emoji 🐟
- **Cá có thể thêm**: Hiển thị với emoji ➕
- **Cá đã chọn**: Hiển thị với emoji 🎯
- **Thông tin chi tiết**: Level, thế hệ, sức mạnh, giá trị

### 2. **Các Nút Thao Tác**
- **➕ Thêm Cá**: Thêm cá được chọn vào túi đấu
- **🗑️ Xóa Cá**: Xóa cá khỏi túi đấu
- **⚔️ Tìm Đối Thủ**: Tìm đối thủ ngẫu nhiên để đấu
- **📊 Thống Kê**: Xem thống kê đấu cá cá nhân

### 3. **Các Nút Phụ**
- **📜 Lịch Sử**: Xem lịch sử đấu gần đây
- **🏆 Bảng Xếp Hạng**: Xem top người chơi đấu cá
- **🔄 Làm Mới**: Cập nhật dữ liệu mới nhất
- **❓ Hướng Dẫn**: Xem hướng dẫn sử dụng

## 🚀 Cách Sử Dụng

### Mở Giao Diện:
```bash
n.fishbattle ui
```

### Quy Trình Sử Dụng:
1. **Chọn cá** từ dropdown menu
2. **Thêm cá** vào túi đấu (nếu là cá có thể thêm)
3. **Tìm đối thủ** để đấu (nếu có cá trong túi đấu)
4. **Xem thống kê** và lịch sử đấu

## 🎨 Giao Diện UI

### Embed Message:
```
⚔️ Hệ Thống Đấu Cá
Quản lý cá đấu và tìm đối thủ!

📦 Túi Đấu Cá
2/5 cá trong túi đấu

🐟 Cá Trong Túi Đấu
🎯 1. Gen 2 Battle Fish (Lv.10, Gen.2)
💪 Power: 350 | 💰 2,000 coins
📊 Stats: 💪70 🏃60 🧠65 🛡️55 🍀60

2. Gen 3 Elite Fish (Lv.10, Gen.3)
💪 Power: 380 | 💰 3,000 coins
📊 Stats: 💪80 🏃75 🧠70 🛡️65 🍀70

📋 Cá Có Thể Thêm Vào Túi Đấu
❌ Không có cá nào đủ điều kiện!

🎯 Cách Sử Dụng
1. Chọn cá từ dropdown bên dưới
2. Thêm cá vào túi đấu
3. Tìm đối thủ để đấu
4. Xóa cá khỏi túi đấu nếu cần
```

### Components:
- **Row 1**: Dropdown chọn cá
- **Row 2**: Nút thao tác chính (Thêm, Đấu, Xóa, Thống kê)
- **Row 3**: Nút phụ (Lịch sử, Bảng xếp hạng, Làm mới, Hướng dẫn)

## 🔧 Kiến Trúc Kỹ Thuật

### Classes:
```typescript
// UI Component
BattleFishUI {
  - createEmbed(): EmbedBuilder
  - createComponents(): ActionRowBuilder[]
  - updateSelectedFish(fishId: string): void
  - getSelectedFishId(): string | undefined
  - canAddSelectedFish(): boolean
  - canRemoveSelectedFish(): boolean
  - getActualFishId(): string | undefined
  - calculatePower(fish: any): number
}

// Interaction Handler
BattleFishHandler {
  - handleInteraction(interaction): void
  - handleSelectMenu(interaction, messageData): void
  - handleButton(interaction, messageData): void
  - handleAddFish(interaction, messageData): void
  - handleRemoveFish(interaction, messageData): void
  - handleFindOpponent(interaction, messageData): void
  - handleShowStats(interaction, messageData): void
  - handleShowHistory(interaction, messageData): void
  - handleShowLeaderboard(interaction, messageData): void
  - handleRefresh(interaction, messageData): void
  - handleShowHelp(interaction, messageData): void
}
```

### Custom IDs:
- `battle_fish_select`: Dropdown chọn cá
- `battle_fish_add`: Nút thêm cá
- `battle_fish_remove`: Nút xóa cá
- `battle_fish_fight`: Nút tìm đối thủ
- `battle_fish_stats`: Nút thống kê
- `battle_fish_history`: Nút lịch sử
- `battle_fish_leaderboard`: Nút bảng xếp hạng
- `battle_fish_refresh`: Nút làm mới
- `battle_fish_help`: Nút hướng dẫn

## 📊 Tính Năng Chi Tiết

### 1. **Dropdown Selection**
```typescript
// Cá trong túi đấu
{
  label: "Gen 2 Battle Fish (Lv.10, Gen.2)",
  description: "Power: 350 | 💰2,000 | Trong túi đấu",
  value: "battle_fish_id",
  emoji: "🐟"
}

// Cá có thể thêm
{
  label: "Gen 3 Elite Fish (Lv.10, Gen.3)",
  description: "Power: 380 | 💰3,000 | Có thể thêm",
  value: "eligible_fish_id",
  emoji: "➕"
}
```

### 2. **Button States**
- **Enabled**: Có thể thực hiện hành động
- **Disabled**: Không thể thực hiện hành động
- **Dynamic**: Thay đổi theo trạng thái hiện tại

### 3. **Power Calculation**
```typescript
calculatePower(fish: any): number {
  const stats = fish.stats || {};
  const basePower = (stats.strength || 0) + 
                   (stats.agility || 0) + 
                   (stats.intelligence || 0) + 
                   (stats.defense || 0) + 
                   (stats.luck || 0);
  return Math.floor(basePower * (1 + fish.level * 0.1));
}
```

## 🎮 Tương Tác Người Dùng

### 1. **Chọn Cá**
- Click dropdown → Chọn cá → UI cập nhật
- Cá được chọn hiển thị 🎯
- Nút thao tác được enable/disable tương ứng

### 2. **Thêm Cá**
- Chọn cá có thể thêm (➕)
- Click "Thêm Cá" → Cá được thêm vào túi đấu
- UI tự động cập nhật

### 3. **Xóa Cá**
- Chọn cá trong túi đấu (🐟)
- Click "Xóa Cá" → Cá được xóa khỏi túi đấu
- UI tự động cập nhật

### 4. **Tìm Đối Thủ**
- Click "Tìm Đối Thủ" → Hiển thị thông tin đối thủ
- Nút "Bắt Đầu Đấu" để xác nhận đấu

## 🔄 State Management

### Message Data Cache:
```typescript
{
  userId: string;
  guildId: string;
  inventory: BattleFishInventory;
  eligibleFish: Fish[];
  selectedFishId?: string;
}
```

### UI Updates:
- **Automatic**: Sau mỗi thao tác thành công
- **Manual**: Khi click "Làm Mới"
- **Real-time**: Khi chọn cá từ dropdown

## 🎨 UI/UX Features

### Visual Design:
- **Color Coding**: Xanh (thành công), đỏ (lỗi), vàng (thông báo)
- **Emoji Icons**: Trực quan và dễ hiểu
- **Consistent Layout**: Cấu trúc rõ ràng và nhất quán

### User Experience:
- **Intuitive**: Dễ sử dụng, không cần đọc hướng dẫn
- **Responsive**: Phản hồi nhanh với mọi thao tác
- **Informative**: Hiển thị đầy đủ thông tin cần thiết
- **Error Handling**: Thông báo lỗi rõ ràng và hướng dẫn khắc phục

### Accessibility:
- **Clear Labels**: Nhãn rõ ràng cho mọi nút
- **Descriptive Text**: Mô tả chi tiết cho mỗi tùy chọn
- **Visual Feedback**: Phản hồi trực quan cho mọi hành động

## 🧪 Testing

### Test Script:
```bash
yarn tsx scripts/test-battle-fish-ui.ts
```

### Test Cases:
1. **UI Creation**: Tạo UI với dữ liệu khác nhau
2. **Fish Selection**: Chọn cá từ dropdown
3. **Button States**: Kiểm tra trạng thái nút
4. **Power Calculation**: Tính toán sức mạnh
5. **Data Updates**: Cập nhật dữ liệu sau thao tác

## 🚀 Performance

### Optimization:
- **Lazy Loading**: Chỉ load dữ liệu khi cần
- **Caching**: Cache message data để tránh query lại
- **Efficient Updates**: Chỉ cập nhật phần cần thiết

### Scalability:
- **Memory Management**: Tự động cleanup message cache
- **Database Queries**: Tối ưu hóa queries với Prisma
- **Component Reuse**: Tái sử dụng components khi có thể

## 🔮 Tính Năng Tương Lai

### Có Thể Phát Triển:
- **Drag & Drop**: Kéo thả cá giữa các túi
- **Bulk Operations**: Thao tác nhiều cá cùng lúc
- **Advanced Filtering**: Lọc cá theo nhiều tiêu chí
- **Sorting Options**: Sắp xếp cá theo stats
- **Custom Themes**: Tùy chỉnh giao diện

### Improvements:
- **Real-time Updates**: Cập nhật real-time khi có thay đổi
- **Keyboard Shortcuts**: Phím tắt cho thao tác nhanh
- **Mobile Optimization**: Tối ưu cho thiết bị di động
- **Accessibility**: Cải thiện khả năng tiếp cận

---

**🎉 Hệ thống UI đấu cá đã sẵn sàng! Cung cấp trải nghiệm người dùng tuyệt vời với giao diện trực quan và dễ sử dụng!** 