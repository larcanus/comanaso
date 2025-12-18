<script setup>
import { computed } from 'vue';
import useUserStore from '@/store/user.js';

const userStore = useUserStore();

// Генерируем случайный цвет для аватара-заглушки на основе имени
const avatarBgColor = computed(() => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
        '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
    ];
    const name = userStore.userFirstName || userStore.userName || 'U';
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
});

// Первая буква для аватара-заглушки
const avatarLetter = computed(() => {
    const name = userStore.userFirstName || userStore.userName || 'U';
    return name.charAt(0).toUpperCase();
});

// Форматирование телефона
const formattedPhone = computed(() => {
    if (!userStore.userPhone) return 'Не указан';
    const phone = userStore.userPhone;
    if (phone.startsWith('7') && phone.length === 11) {
        return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
    }
    return phone;
});

// Форматирование статуса
const statusText = computed(() => {
    if (!userStore.userStatus) return 'Нет данных';
    
    if (userStore.isOnline) {
        return 'В сети';
    }
    
    if (userStore.lastSeen) {
        const date = userStore.lastSeen;
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        
        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    return 'Офлайн';
});

// Язык
const languageName = computed(() => {
    const langMap = {
        'ru': 'Русский',
        'en': 'English',
        'uk': 'Українська',
        'de': 'Deutsch',
        'es': 'Español',
        'fr': 'Français',
        'it': 'Italiano',
        'pt': 'Português',
    };
    return langMap[userStore.userLangCode] || userStore.userLangCode || 'Не указан';
});
</script>

<template>
    <div class="user-info-card">
        <div class="card-header">
            <h3>Информация о пользователе</h3>
        </div>
        
        <div class="card-content">
            <!-- Аватар -->
            <div class="avatar-section">
                <div v-if="userStore.userAvatar" class="avatar">
                    <img :src="userStore.userAvatar" alt="Аватар" />
                </div>
                <div 
                    v-else 
                    class="avatar-placeholder" 
                    :style="{ backgroundColor: avatarBgColor }"
                >
                    <span class="avatar-letter">{{ avatarLetter }}</span>
                </div>
            </div>
            
            <!-- Основная информация -->
            <div class="info-section">
                <!-- Основной блок -->
                <div class="info-main">
                    <div class="info-row primary">
                        <h2 class="user-name">{{ userStore.fullName }}</h2>
                        <div class="badges">
                            <span v-if="userStore.userIsPremium" class="badge premium" title="Premium пользователь">
                                ⭐ Premium
                            </span>
                            <span v-if="userStore.userIsVerified" class="badge verified" title="Верифицирован">
                                ✓ Verified
                            </span>
                            <span v-if="userStore.userIsBot" class="badge bot" title="Бот">
                                🤖 Bot
                            </span>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-item highlight">
                            <span class="info-label">📱 Телефон:</span>
                            <span class="info-value">{{ formattedPhone }}</span>
                        </div>
                        <div class="info-item highlight">
                            <span class="info-label">🆔 ID:</span>
                            <span class="info-value">{{ userStore.userId }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Дополнительная информация -->
                <div class="info-additional">
                    <div v-if="userStore.hasUsername" class="info-item">
                        <span class="info-label">👤 Username:</span>
                        <span class="info-value">@{{ userStore.userName }}</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">🌐 Язык:</span>
                        <span class="info-value">{{ languageName }}</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">📊 Статус:</span>
                        <span 
                            class="info-value status"
                            :class="{ online: userStore.isOnline }"
                        >
                            {{ statusText }}
                        </span>
                    </div>
                    
                    <div v-if="userStore.hasBio" class="info-item bio">
                        <span class="info-label">📝 О себе:</span>
                        <p class="info-value bio-text">{{ userStore.userBio }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-info-card {
    width: 100%;
    max-width: 1000px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    margin-bottom: 30px;
}

.card-header {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px;
    text-align: center;
}

.card-header h3 {
    color: #ffffff;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}

.card-content {
    display: flex;
    flex-direction: row;
    gap: 30px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.95);
}

/* Аватар */
.avatar-section {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
}

.avatar,
.avatar-placeholder {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-letter {
    font-size: 64px;
    color: #ffffff;
    font-weight: bold;
}

/* Информация */
.info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-main {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
}

.info-row.primary {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e0e0e0;
}

.user-name {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
}

.badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.premium {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    color: #333;
}

.badge.verified {
    background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
    color: #fff;
}

.badge.bot {
    background: linear-gradient(135deg, #a8dadc 0%, #457b9d 100%);
    color: #fff;
}

.info-item {
    display: flex;
    gap: 8px;
    align-items: baseline;
    flex: 1;
    min-width: 200px;
}

.info-item.highlight {
    background: rgba(102, 126, 234, 0.1);
    padding: 10px 15px;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.info-item.bio {
    flex-direction: column;
    align-items: flex-start;
}

.info-label {
    font-weight: 600;
    color: #555;
    white-space: nowrap;
}

.info-value {
    color: #2c3e50;
    font-weight: 500;
}

.info-value.status {
    color: #e74c3c;
}

.info-value.status.online {
    color: #27ae60;
    font-weight: 600;
}

.bio-text {
    margin: 5px 0 0 0;
    color: #555;
    line-height: 1.6;
    font-style: italic;
}

.info-additional {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 10px;
}

/* Адаптивность */
@media (max-width: 768px) {
    .card-content {
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }
    
    .avatar-section {
        align-items: center;
    }
    
    .avatar,
    .avatar-placeholder {
        width: 120px;
        height: 120px;
    }
    
    .avatar-letter {
        font-size: 48px;
    }
    
    .info-section {
        width: 100%;
    }
    
    .user-name {
        font-size: 24px;
        text-align: center;
        width: 100%;
    }
    
    .info-row.primary {
        align-items: center;
    }
    
    .badges {
        justify-content: center;
    }
    
    .info-item {
        min-width: 100%;
    }
}

@media (max-width: 480px) {
    .card-header h3 {
        font-size: 20px;
    }
    
    .user-name {
        font-size: 20px;
    }
    
    .info-item {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
    }
    
    .info-label {
        font-size: 14px;
    }
    
    .info-value {
        font-size: 14px;
    }
}
</style>