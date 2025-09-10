# 🎯 Hệ Thống Skills Cho Cá - Thiết Kế Chi Tiết

## 📋 Tổng Quan

Hệ thống skills cho cá được thiết kế với các thuộc tính cụ thể như bạn yêu cầu:

- **id**: Mã định danh skill
- **name**: Tên skill
- **element**: Hệ (fire, water, earth, air, light, dark)
- **emoji**: Biểu tượng skill
- **description**: Mô tả skill
- **baseCost**: Giá FishCoin cơ bản
- **baseDamage**: Damage cơ bản
- **damageMultiplier**: Hệ số damage cơ bản
- **damagePerLevel**: Hệ số tăng damage mỗi cấp

## 🎨 Phân Loại Skills Theo Hệ

### **🔥 Fire Element (Hỏa)**
- **Fire Breath**: Hơi thở lửa - Burn effect
- **Fireball**: Quả cầu lửa - Damage cao
- **Inferno**: Hỏa ngục - AoE damage

### **💧 Water Element (Thủy)**
- **Water Slash**: Cắt nước - Tấn công nhanh
- **Ice Shield**: Khiên băng - Bảo vệ + Freeze
- **Tsunami**: Sóng thần - AoE damage

### **🪨 Earth Element (Thổ)**
- **Stone Fist**: Nắm đấm đá - Damage cao
- **Earth Wall**: Tường đất - Bảo vệ + Reflect
- **Earthquake**: Động đất - AoE + Stun

### **💨 Air Element (Phong)**
- **Wind Slash**: Cắt gió - Cooldown ngắn
- **Tornado**: Lốc xoáy - Cuốn kẻ thù
- **Hurricane**: Bão tố - AoE damage

### **✨ Light Element (Quang)**
- **Light Beam**: Tia sáng - Damage cao
- **Healing Light**: Ánh sáng hồi phục - Heal
- **Divine Strike**: Đòn đánh thần thánh - Ultimate

### **🌑 Dark Element (Ám)**
- **Shadow Claw**: Móng vuốt bóng tối - Stealth
- **Dark Magic**: Ma thuật bóng tối - Magic damage
- **Void Strike**: Đòn đánh hư không - Ultimate

## 🎮 Cơ Chế Hoạt Động

### **Học Skill**
```typescript
// Ví dụ: Học Fire Breath Level 1
const result = await FishSkillService.learnSkill(
    fishId, 
    'fire_breath', 
    userId, 
    guildId
);
// Cost: 5,000 FishCoin
// Damage: 120 * 1.2 = 144
```

### **Nâng Cấp Skill**
```typescript
// Ví dụ: Nâng Fire Breath từ Level 1 → 2
const result = await FishSkillService.upgradeSkill(
    fishId, 
    'fire_breath', 
    userId, 
    guildId
);
// Cost: 5,000 * 1.5^1 = 7,500 FishCoin
// Damage: 120 * 1.2 * (1 + 0.15) = 165.6
```

### **Tính Damage Trong Battle**
```typescript
// Ví dụ: Fire Breath Level 3 với Strength 80
const damage = FishSkillService.calculateSkillDamage(
    'fire_breath', 
    3, 
    { strength: 80 }
);
// Base: 120 * 1.2 * (1 + 2 * 0.15) = 187.2
// Stat Bonus: 80 * 0.5 = 40
// Total: 187.2 + 40 = 227.2
```

## 💰 Hệ Thống Kinh Tế

### **Chi Phí Học Skill**
- **Level 1**: Base cost (5,000 - 20,000 FishCoin)
- **Level 2**: Base cost × 1.5
- **Level 3**: Base cost × 2.25
- **Level 4**: Base cost × 3.375
- **Level 5**: Base cost × 5.0625

### **Hoàn Tiền Khi Quên Skill**
- Hoàn lại 50% tổng chi phí đã bỏ ra
- Ví dụ: Học Fire Breath Level 3 → Quên = Hoàn 50% của (5,000 + 7,500 + 11,250)

## 🎯 Tích Hợp Vào Battle System

### **Skill Activation**
```typescript
// Trong battle, kiểm tra skill có thể dùng
const canUseSkill = !await FishSkillService.isSkillOnCooldown(fishId, skillId);

if (canUseSkill) {
    const damage = FishSkillService.calculateSkillDamage(skillId, level, fishStats);
    // Thực hiện damage
    await FishSkillService.updateSkillUsage(fishId, skillId);
}
```

### **Skill Effects**
```typescript
// Ví dụ: Fire Breath với Burn effect
if (skill.effects?.burn) {
    const burnChance = skill.effects.burn * level; // 0.1 * level
    if (Math.random() < burnChance) {
        opponent.addBurnEffect(3); // 3 rounds burn
    }
}
```

## 🏆 Requirements System

### **Level Requirements**
- **Basic Skills**: Level 10+
- **Intermediate Skills**: Level 15+
- **Advanced Skills**: Level 20+
- **Ultimate Skills**: Level 25+

### **Stats Requirements**
- **Fire Skills**: Cần Strength
- **Water Skills**: Cần Agility
- **Earth Skills**: Cần Strength + Defense
- **Air Skills**: Cần Agility + Intelligence
- **Light Skills**: Cần Intelligence
- **Dark Skills**: Cần Intelligence + Strength

### **Rarity Requirements**
- **Common Skills**: Không yêu cầu rarity
- **Rare Skills**: Cần cá Rare+
- **Epic Skills**: Cần cá Epic+
- **Legendary Skills**: Cần cá Legendary

## 🎨 UI/UX Design

### **Skill Tree View**
```
🔥 Fire Skills
├── Fire Breath (Level 3) ✅
├── Fireball (Level 1) ✅
└── Inferno (Locked) ❌

💧 Water Skills
├── Water Slash (Available) ➕
├── Ice Shield (Locked) ❌
└── Tsunami (Locked) ❌
```

### **Skill Details**
```
🔥 Fire Breath (Level 3)
Damage: 187 + 40 (Strength) = 227
Cost: 5,000 FishCoin
Cooldown: 3 rounds
Effect: 30% Burn chance
```

## 🚀 Implementation Plan

### **Phase 1: Database & Service** ✅
- [x] Tạo database schema
- [x] Tạo skill definitions
- [x] Tạo FishSkillService

### **Phase 2: UI Components**
- [ ] FishSkillUI component
- [ ] SkillTreeView component
- [ ] SkillDetailsModal component

### **Phase 3: Battle Integration**
- [ ] Tích hợp skills vào battle system
- [ ] Thêm skill effects và animations
- [ ] Balance testing

### **Phase 4: Advanced Features**
- [ ] Skill combos
- [ ] Elemental advantages
- [ ] Skill mastery bonuses

## 📊 Balance Considerations

### **Damage Scaling**
- **Level 1**: Base damage
- **Level 2**: +15% damage
- **Level 3**: +30% damage
- **Level 4**: +45% damage
- **Level 5**: +60% damage

### **Cost Scaling**
- **Level 1**: Base cost
- **Level 2**: +50% cost
- **Level 3**: +125% cost
- **Level 4**: +237.5% cost
- **Level 5**: +406.25% cost

### **Cooldown Balance**
- **Basic Skills**: 1-3 rounds
- **Intermediate Skills**: 3-4 rounds
- **Advanced Skills**: 4-6 rounds
- **Ultimate Skills**: 6-8 rounds

## 🎯 Ví Dụ Cụ Thể

### **Fire Breath Skill**
```typescript
{
    id: 'fire_breath',
    name: 'Hơi Thở Lửa',
    element: 'fire',
    emoji: '🔥',
    description: 'Tấn công bằng hơi thở lửa, gây burn damage',
    baseCost: 5000,
    baseDamage: 120,
    damageMultiplier: 1.2,
    damagePerLevel: 0.15,
    maxLevel: 5,
    cooldown: 3,
    requirements: { level: 10, strength: 50 },
    effects: { burn: 0.1 }
}
```

### **Damage Calculation**
- **Level 1**: 120 × 1.2 = 144 damage
- **Level 2**: 120 × 1.2 × 1.15 = 165.6 damage
- **Level 3**: 120 × 1.2 × 1.30 = 187.2 damage
- **Level 4**: 120 × 1.2 × 1.45 = 208.8 damage
- **Level 5**: 120 × 1.2 × 1.60 = 230.4 damage

### **Cost Calculation**
- **Level 1**: 5,000 FishCoin
- **Level 2**: 5,000 × 1.5 = 7,500 FishCoin
- **Level 3**: 5,000 × 2.25 = 11,250 FishCoin
- **Level 4**: 5,000 × 3.375 = 16,875 FishCoin
- **Level 5**: 5,000 × 5.0625 = 25,312 FishCoin

Hệ thống này cung cấp một framework hoàn chỉnh cho việc học, nâng cấp và sử dụng skills trong battle system!
