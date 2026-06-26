# 🎯 Hệ Thống Skills - Success Rate Thay Vì Cooldown

## 📋 Tổng Quan

Đã cập nhật hệ thống skills để sử dụng **tỷ lệ thành công** thay vì **cooldown**. Điều này làm cho battle system thú vị hơn với yếu tố may rủi và chiến thuật.

## 🔄 Thay Đổi Chính

### **Trước (Cooldown System)**
```typescript
{
    cooldown: 3, // Cooldown 3 rounds
}
```

### **Sau (Success Rate System)**
```typescript
{
    baseSuccessRate: 0.75, // 75% thành công
    successRatePerLevel: 0.05, // +5% mỗi level
}
```

## 🎯 Success Rate Logic

### **Công Thức Tính Success Rate**
```typescript
successRate = baseSuccessRate + (level - 1) * successRatePerLevel
successRate = Math.min(successRate, 0.95) // Tối đa 95%
```

### **Ví Dụ Tính Toán**

#### **Fire Breath (Level 1-5)**
- **Level 1**: 75% + (1-1) × 5% = **75%**
- **Level 2**: 75% + (2-1) × 5% = **80%**
- **Level 3**: 75% + (3-1) × 5% = **85%**
- **Level 4**: 75% + (4-1) × 5% = **90%**
- **Level 5**: 75% + (5-1) × 5% = **95%** (tối đa)

#### **Volcano (Level 1-5)**
- **Level 1**: 45% + (1-1) × 10% = **45%**
- **Level 2**: 45% + (2-1) × 10% = **55%**
- **Level 3**: 45% + (3-1) × 10% = **65%**
- **Level 4**: 45% + (4-1) × 10% = **75%**
- **Level 5**: 45% + (5-1) × 10% = **85%**

## 🔥 Fire Skills (4 skills)

### **1. Hơi Thở Lửa** 🔥
- **Cost**: 5,000 FishCoin
- **Damage**: 120 base
- **Success Rate**: 75% → 95% (Level 1-5)
- **Requirements**: Level 10, Strength 50
- **Effects**: Burn 10%

### **2. Quả Cầu Lửa** 🔥
- **Cost**: 8,000 FishCoin
- **Damage**: 150 base
- **Success Rate**: 65% → 93% (Level 1-5)
- **Requirements**: Level 12, Strength 60
- **Effects**: Burn 15%

### **3. Bão Lửa** 🔥
- **Cost**: 15,000 FishCoin
- **Damage**: 200 base
- **Success Rate**: 55% → 87% (Level 1-5)
- **Requirements**: Level 18, Strength 80, Rare
- **Effects**: Burn 20%

### **4. Hỏa Diệm Sơn** 🌋
- **Cost**: 25,000 FishCoin
- **Damage**: 300 base
- **Success Rate**: 45% → 85% (Level 1-5)
- **Requirements**: Level 25, Strength 100, Epic
- **Effects**: Burn 25%

## 💧 Water Skills (4 skills)

### **1. Sóng Thủy Triều** 🌊
- **Cost**: 5,000 FishCoin
- **Damage**: 110 base
- **Success Rate**: 80% → 96% (Level 1-5)
- **Requirements**: Level 10, Agility 50
- **Effects**: Freeze 10%

### **2. Băng Giá** ❄️
- **Cost**: 7,500 FishCoin
- **Damage**: Support skill
- **Success Rate**: 70% → 94% (Level 1-5)
- **Requirements**: Level 12, Intelligence 60
- **Effects**: Freeze 20%

### **3. Đại Hồng Thủy** 🌊
- **Cost**: 12,000 FishCoin
- **Damage**: 180 base
- **Success Rate**: 60% → 92% (Level 1-5)
- **Requirements**: Level 15, Agility 70, Rare
- **Effects**: Freeze 15%

### **4. Băng Hà** 🧊
- **Cost**: 20,000 FishCoin
- **Damage**: 250 base
- **Success Rate**: 50% → 90% (Level 1-5)
- **Requirements**: Level 22, Intelligence 80, Epic
- **Effects**: Freeze 30%

## 🪨 Earth Skills (4 skills)

### **1. Địa Chấn** 🌍
- **Cost**: 6,000 FishCoin
- **Damage**: 130 base
- **Success Rate**: 70% → 94% (Level 1-5)
- **Requirements**: Level 11, Strength 55
- **Effects**: Stun 10%

### **2. Thạch Thành** 🪨
- **Cost**: 9,000 FishCoin
- **Damage**: Support skill
- **Success Rate**: 85% → 97% (Level 1-5)
- **Requirements**: Level 14, Defense 65
- **Effects**: Shield 20%

### **3. Núi Lửa** ⛰️
- **Cost**: 18,000 FishCoin
- **Damage**: 220 base
- **Success Rate**: 60% → 92% (Level 1-5)
- **Requirements**: Level 20, Strength 85, Rare
- **Effects**: Stun 15%

### **4. Đại Địa Chấn** 🌋
- **Cost**: 30,000 FishCoin
- **Damage**: 350 base
- **Success Rate**: 40% → 88% (Level 1-5)
- **Requirements**: Level 28, Strength 120, Legendary
- **Effects**: Stun 25%

## 💨 Air Skills (4 skills)

### **1. Gió Cuốn** 💨
- **Cost**: 4,500 FishCoin
- **Damage**: 100 base
- **Success Rate**: 80% → 96% (Level 1-5)
- **Requirements**: Level 9, Agility 45
- **Effects**: None

### **2. Bão Tố** 🌀
- **Cost**: 8,500 FishCoin
- **Damage**: 140 base
- **Success Rate**: 65% → 93% (Level 1-5)
- **Requirements**: Level 13, Agility 65
- **Effects**: None

### **3. Lốc Xoáy** 🌪️
- **Cost**: 16,000 FishCoin
- **Damage**: 190 base
- **Success Rate**: 55% → 91% (Level 1-5)
- **Requirements**: Level 19, Agility 85, Rare
- **Effects**: None

### **4. Siêu Bão** 🌪️
- **Cost**: 28,000 FishCoin
- **Damage**: 280 base
- **Success Rate**: 45% → 89% (Level 1-5)
- **Requirements**: Level 26, Agility 110, Epic
- **Effects**: None

## ✨ Light Skills (4 skills)

### **1. Ánh Sáng Thánh** ✨
- **Cost**: 7,000 FishCoin
- **Damage**: 125 base
- **Success Rate**: 75% → 95% (Level 1-5)
- **Requirements**: Level 12, Intelligence 60
- **Effects**: Heal 10%

### **2. Quang Minh** ☀️
- **Cost**: 11,000 FishCoin
- **Damage**: 160 base
- **Success Rate**: 70% → 94% (Level 1-5)
- **Requirements**: Level 16, Intelligence 80
- **Effects**: Heal 15%

### **3. Thiên Thần Hộ Mệnh** 👼
- **Cost**: 22,000 FishCoin
- **Damage**: Support skill
- **Success Rate**: 60% → 92% (Level 1-5)
- **Requirements**: Level 24, Intelligence 100, Epic
- **Effects**: Shield 30%, Heal 20%

### **4. Thánh Quang** ☀️
- **Cost**: 35,000 FishCoin
- **Damage**: 400 base
- **Success Rate**: 35% → 87% (Level 1-5)
- **Requirements**: Level 30, Intelligence 130, Legendary
- **Effects**: Heal 30%

## 🌑 Dark Skills (4 skills)

### **1. Bóng Tối** 🌑
- **Cost**: 6,500 FishCoin
- **Damage**: 115 base
- **Success Rate**: 70% → 94% (Level 1-5)
- **Requirements**: Level 11, Luck 55
- **Effects**: None

### **2. Ám Khí** 🌫️
- **Cost**: 10,000 FishCoin
- **Damage**: 145 base
- **Success Rate**: 65% → 93% (Level 1-5)
- **Requirements**: Level 15, Luck 70
- **Effects**: None

### **3. Ma Quỷ** 👹
- **Cost**: 19,000 FishCoin
- **Damage**: 210 base
- **Success Rate**: 55% → 91% (Level 1-5)
- **Requirements**: Level 21, Luck 90, Epic
- **Effects**: None

### **4. Hắc Ám Tuyệt Đối** 🌑
- **Cost**: 32,000 FishCoin
- **Damage**: 320 base
- **Success Rate**: 40% → 88% (Level 1-5)
- **Requirements**: Level 27, Luck 120, Legendary
- **Effects**: None

## 🎮 Battle Mechanics

### **Skill Usage Logic**
```typescript
// Trong battle
const successRate = FishSkillHelper.calculateSkillSuccessRate(skill, level);
const random = Math.random();

if (random < successRate) {
    // Skill thành công - gây damage và effects
    applySkillEffects(skill, target);
} else {
    // Skill thất bại - không gây damage
    console.log(`${skill.name} thất bại!`);
}
```

### **Strategic Considerations**
- **High Success Rate Skills**: Đáng tin cậy, ít rủi ro
- **Low Success Rate Skills**: Mạnh mẽ nhưng rủi ro cao
- **Level Up Benefits**: Tăng cả damage và success rate
- **Risk vs Reward**: Skills mạnh có success rate thấp hơn

## 🎯 UI Updates

### **All Skills View**
```
🔥 Hơi Thở Lửa
💰 5,000 FishCoin | 💥 120 damage | 🎯 75% thành công
📋 Level 10 | Common | fire
```

### **Fish Skills View**
```
🔥 Hơi Thở Lửa (Lv.3)
💥 Damage: 187 | 🎯 Thành công: 85%
⬆️ Nâng cấp: 16,875 FishCoin
```

### **Skill Details**
```
🔥 Hơi Thở Lửa
📝 Tấn công bằng hơi thở lửa, gây burn damage
💥 Damage: 187
🎯 Thành công: 85%
💰 Cost: 5,000 FishCoin
```

## 📊 Success Rate Distribution

### **By Rarity**
- **Common Skills**: 70-80% base success rate
- **Rare Skills**: 55-65% base success rate
- **Epic Skills**: 45-60% base success rate
- **Legendary Skills**: 35-50% base success rate

### **By Element**
- **Water**: Highest success rates (80-85%)
- **Air**: High success rates (80%)
- **Fire**: Medium success rates (65-75%)
- **Earth**: Medium success rates (70-85%)
- **Light**: Medium success rates (60-75%)
- **Dark**: Medium success rates (55-70%)

## 🎉 Benefits of Success Rate System

### **1. Strategic Depth**
- Players must consider risk vs reward
- High-level skills become more valuable
- Battle outcomes are less predictable

### **2. Skill Progression**
- Leveling up improves both damage and reliability
- Investment in skills feels more meaningful
- Clear progression path for each skill

### **3. Battle Excitement**
- Every skill use is suspenseful
- Comeback victories are possible
- No more waiting for cooldowns

### **4. Balanced Gameplay**
- Powerful skills have lower success rates
- Support skills have higher success rates
- All skills remain viable at high levels

Hệ thống success rate đã được implement hoàn chỉnh và sẵn sàng để sử dụng! 🚀
