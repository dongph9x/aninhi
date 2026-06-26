# 🎣 Giảm Tỷ Lệ Bonus Cần Câu Và Mồi + Giới Hạn Câu Cá Huyền Thoại

## 📋 Tổng Quan
Đã thực hiện hai thay đổi lớn để cân bằng hệ thống câu cá:

1. **Giảm tỷ lệ bonus** của tất cả cần câu và mồi xuống **một nửa** so với trước đây
2. **Giới hạn câu cá huyền thoại** - chỉ có thể câu được cá huyền thoại khi sử dụng **cần câu kim cương + mồi thần**

## 🔄 Thay Đổi Chi Tiết

### 🎣 Cần Câu
| Loại Cần Câu | Bonus Cũ | Bonus Mới | Giảm |
|--------------|----------|-----------|------|
| Cần câu cơ bản | 0% | 0% | 0% |
| Cần câu đồng | 2% | 1% | 1% |
| Cần câu bạc | 4% | 2% | 2% |
| Cần câu vàng | 7% | 3.5% | 3.5% |
| Cần câu kim cương | 10% | 5% | 5% |

### 🪱 Mồi
| Loại Mồi | Bonus Cũ | Bonus Mới | Giảm |
|----------|----------|-----------|------|
| Mồi cơ bản | 0% | 0% | 0% |
| Mồi ngon | 3% | 1.5% | 1.5% |
| Mồi thượng hạng | 6% | 3% | 3% |
| Mồi thần | 10% | 5% | 5% |

## 📊 Tác Động Đến Tỷ Lệ Cá Huyền Thoại

### ⚠️ Thay Đổi Quan Trọng
- **Chỉ có thể câu được cá huyền thoại với tỷ lệ cao (4.96%) khi dùng cần câu kim cương + mồi thần**
- **Tất cả các trường hợp khác vẫn có thể câu được cá huyền thoại nhưng tỷ lệ rất thấp (< 1%)**

### Tỷ Lệ Cơ Bản (Không Có Bonus)
- **Tỷ lệ cá huyền thoại:** 0.02% (rất thấp)

### Tỷ Lệ Tối Đa (Cần Câu Kim Cương + Mồi Thần)
- **Tỷ lệ cũ:** 6.72%
- **Tỷ lệ mới:** 4.96%
- **Giảm:** 1.76% (26.2%)
- **Điều kiện:** Phải có cần câu kim cương + mồi thần

## 🎯 Lý Do Thay Đổi

1. **Cân Bằng Hệ Thống:** Giảm tỷ lệ bonus để tránh việc người chơi có cần câu và mồi tốt có lợi thế quá lớn
2. **Tăng Tính Thách Thức:** Làm cho việc câu được cá huyền thoại trở nên cực kỳ khó khăn
3. **Ưu Tiên Đầu Tư:** Chỉ những người chơi có đủ tài nguyên mới có thể câu được cá huyền thoại với tỷ lệ cao
4. **Công Bằng:** Đảm bảo tất cả người chơi đều có cơ hội câu được cá huyền thoại (dù tỷ lệ rất thấp)
5. **Tăng Giá Trị:** Làm cho cá huyền thoại thực sự hiếm và quý giá

## ✅ Những Gì Không Thay Đổi

- **Giá cả:** Tất cả cần câu và mồi vẫn giữ nguyên giá
- **Độ bền:** Độ bền của cần câu không thay đổi
- **Logic tính toán:** Cách tính tỷ lệ vẫn giữ nguyên, chỉ giảm giá trị bonus

## 🔧 Files Đã Thay Đổi

1. **`src/utils/fishing.ts`**
   - Cập nhật `rarityBonus` trong `FISHING_RODS`
   - Cập nhật `rarityBonus` trong `BAITS`
   - Cập nhật mô tả tương ứng
   - **Thêm logic giới hạn câu cá huyền thoại** - chỉ cho phép câu được cá huyền thoại với cần câu kim cương + mồi thần

2. **`scripts/calculate-legendary-fish-rate.ts`**
   - Cập nhật comment để phản ánh tỷ lệ mới
   - **Thêm logic kiểm tra điều kiện câu cá huyền thoại**

3. **`scripts/compare-fishing-bonus-rates.ts`** (Mới)
   - Script so sánh tỷ lệ cũ và mới

4. **`scripts/test-fishing-bonus-reduction.ts`** (Mới)
   - Script test kiểm tra thay đổi

5. **`scripts/test-legendary-fishing-restriction.ts`** (Mới)
   - Script test kiểm tra logic giới hạn câu cá huyền thoại

## 📈 Kết Quả

Sau khi thay đổi:
- **Hệ thống câu cá trở nên cân bằng hơn**
- **Chỉ cần câu kim cương + mồi thần mới có tỷ lệ cá huyền thoại cao (4.96%)**
- **Tất cả các trường hợp khác vẫn có thể câu được cá huyền thoại nhưng tỷ lệ rất thấp (< 1%)**
- **Tỷ lệ cá huyền thoại tối đa giảm từ 6.72% xuống 4.96%**
- **Vẫn duy trì tính thú vị và thách thức cho người chơi**
- **Không ảnh hưởng đến kinh tế game (giá cả không đổi)**
- **Cá huyền thoại giờ đây thực sự hiếm và quý giá!**
- **Đảm bảo công bằng: ai cũng có cơ hội câu được cá huyền thoại**

## 🎮 Khuyến Nghị Cho Người Chơi

1. **Đầu tư thông minh:** Cần câu và mồi vẫn có giá trị, nhưng hiệu quả giảm một nửa
2. **Mục tiêu cao cấp:** Để câu được cá huyền thoại, cần đầu tư vào cần câu kim cương (50,000 FishCoin) và mồi thần (1,000 FishCoin/lần)
3. **Kiên nhẫn:** Việc câu được cá huyền thoại giờ đây cực kỳ khó khăn và chỉ dành cho những người chơi có đủ tài nguyên
4. **Chiến lược:** Tập trung vào việc câu cá thường và hiếm để kiếm lợi nhuận ổn định
5. **Lên cấp dần:** Bắt đầu với cần câu và mồi cơ bản, sau đó nâng cấp dần lên

---

*Thay đổi này được thực hiện để cải thiện trải nghiệm chơi game và đảm bảo tính công bằng cho tất cả người chơi.* 