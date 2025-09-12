/**
 * 🌐 Effect Translator Utility
 * Dịch effect IDs thành tên tiếng Việt dễ hiểu
 */

export interface EffectTranslation {
    name: string;
    description: string;
    emoji: string;
}

export const EFFECT_TRANSLATIONS: Record<string, EffectTranslation> = {
    // Combat Effects
    skill_lock: {
        name: "Khóa Kỹ Năng",
        description: "Ngăn chặn mục tiêu sử dụng kỹ năng",
        emoji: "🔒"
    },
    
    // Damage Effects
    burn: {
        name: "Thiêu Đốt",
        description: "Gây sát thương lửa theo thời gian",
        emoji: "🔥"
    },
    poison: {
        name: "Độc Hại",
        description: "Gây sát thương độc theo thời gian",
        emoji: "☠️"
    },
    
    // Control Effects
    freeze: {
        name: "Đóng Băng",
        description: "Làm chậm và giảm sát thương",
        emoji: "❄️"
    },
    stun: {
        name: "Choáng Váng",
        description: "Ngăn chặn hành động trong 1 lượt",
        emoji: "⚡"
    },
    petrify: {
        name: "Hóa Đá",
        description: "Ngăn chặn tất cả hành động",
        emoji: "🗿"
    },
    confusion: {
        name: "Rối Loạn",
        description: "Có thể tự tấn công bản thân",
        emoji: "🌀"
    },
    shadow_bind: {
        name: "Trói Buộc Bóng Tối",
        description: "Giảm tốc độ và khả năng né tránh",
        emoji: "🌑"
    },
    
    // Buff Effects
    regeneration: {
        name: "Hồi Phục",
        description: "Hồi máu theo thời gian",
        emoji: "💚"
    },
    berserk: {
        name: "Cuồng Nộ",
        description: "Tăng sát thương nhưng giảm phòng thủ",
        emoji: "😡"
    },
    wind_boost: {
        name: "Tăng Tốc Gió",
        description: "Tăng tốc độ và khả năng né tránh",
        emoji: "💨"
    },
    divine_blessing: {
        name: "Phước Lành Thần Thánh",
        description: "Tăng tất cả chỉ số",
        emoji: "✨"
    },
    
    // Defensive Effects
    water_shield: {
        name: "Khiên Nước",
        description: "Giảm sát thương nhận vào",
        emoji: "🛡️"
    },
    earth_armor: {
        name: "Giáp Đất",
        description: "Tăng phòng thủ đáng kể",
        emoji: "🏔️"
    },
    
    // Special Effects
    fire_rage: {
        name: "Cơn Thịnh Nộ Lửa",
        description: "Tăng sát thương lửa và tốc độ",
        emoji: "🔥"
    },
    darkness_curse: {
        name: "Lời Nguyền Bóng Tối",
        description: "Giảm tất cả chỉ số của mục tiêu",
        emoji: "🌑"
    },
    blinding_light: {
        name: "Ánh Sáng Chói Lòa",
        description: "Giảm độ chính xác và khả năng phản ứng",
        emoji: "☀️"
    }
};

/**
 * Dịch effect ID thành tên tiếng Việt
 */
export function translateEffectId(effectId: string): EffectTranslation {
    return EFFECT_TRANSLATIONS[effectId] || {
        name: effectId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: "Hiệu ứng đặc biệt",
        emoji: "✨"
    };
}

/**
 * Format effect display với tên tiếng Việt
 */
export function formatEffectDisplay(effectId: string, chance?: number, intensity?: number): string {
    const translation = translateEffectId(effectId);
    
    let display = `${translation.emoji} **${translation.name}**`;
    
    if (chance !== undefined) {
        display += ` (${Math.round(chance * 100)}%)`;
    }
    
    if (intensity !== undefined) {
        display += ` [${Math.round(intensity * 100)}%]`;
    }
    
    return display;
}

/**
 * Format multiple effects với tên tiếng Việt
 */
export function formatMultipleEffects(
    effectIds: string[], 
    effectChances?: Record<string, number>, 
    effectIntensities?: Record<string, number>
): string {
    const effectDetails = effectIds.map(effectId => {
        const chance = effectChances?.[effectId] || 0;
        const intensity = effectIntensities?.[effectId];
        return formatEffectDisplay(effectId, chance, intensity);
    }).join(', ');
    
    return effectDetails;
}
