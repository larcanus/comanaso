<script setup>
import { computed } from 'vue';
import useUserStore from '@/store/user.js';
import { getColorFromString, getFirstLetter } from '@/utils/colorUtils.js';

const userStore = useUserStore();

// Генерируем случайный цвет для аватара-заглушки на основе имени
const avatarBgColor = computed(() => {
    const name = userStore.userFirstName || userStore.userName || 'U';
    return getColorFromString(name);
});

// Первая буква для аватара-заглушки
const avatarLetter = computed(() => {
    const name = userStore.userFirstName || userStore.userName || 'U';
    return getFirstLetter(name);
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
            year: 'numeric',
        });
    }

    return 'Офлайн';
});

// Язык
const languageName = computed(() => {
    const langMap = {
        ru: 'Русский',
        en: 'English',
        uk: 'Українська',
        de: 'Deutsch',
        es: 'Español',
        fr: 'Français',
        it: 'Italiano',
        pt: 'Português',
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
                <div v-else class="avatar-placeholder" :style="{ backgroundColor: avatarBgColor }">
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
                            <span
                                v-if="userStore.userIsPremium"
                                class="badge premium"
                                title="Premium пользователь"
                            >
                                Premium
                            </span>
                            <span
                                v-if="userStore.userIsVerified"
                                class="badge verified"
                                title="Верифицирован"
                            >
                                Verified
                            </span>
                            <span v-if="userStore.userIsBot" class="badge bot" title="Бот">
                                Bot
                            </span>
                        </div>
                    </div>

                    <div class="info-row">
                        <div class="info-item highlight">
                            <span class="info-label">Т:</span>
                            <span class="info-value phone">{{ formattedPhone }}</span>
                        </div>
                        <div class="info-item highlight">
                            <span class="info-label">ID:</span>
                            <span class="info-value">{{ userStore.userId }}</span>
                        </div>
                    </div>
                </div>

                <!-- Дополнительная информация -->
                <div class="info-additional">
                    <div v-if="userStore.hasUsername" class="info-item">
                        <span class="info-label">Username:</span>
                        <span class="info-value">@{{ userStore.userName }}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Язык:</span>
                        <span class="info-value">{{ languageName }}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Статус:</span>
                        <span class="info-value status" :class="{ online: userStore.isOnline }">
                            {{ statusText }}
                        </span>
                    </div>

                    <div v-if="userStore.hasBio" class="info-item bio">
                        <span class="info-label">О себе:</span>
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
    max-width: 750px;
    border: 1px solid #ccc;
    border-radius: 2px;
    overflow: hidden;
    margin: 10px;
    box-sizing: border-box;
}

.card-header {
    background-color: var(--vt-bt-background-color);
    padding: 10px;
    text-align: center;
}

.card-header h3 {
    color: var(--vt-c-white);
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.card-content {
    display: flex;
    flex-direction: row;
    gap: 15px;
    padding: 10px;
    background-color: var(--color-background);
}

/* Аватар */
.avatar-section {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
}

.avatar,
.avatar-placeholder {
    width: 105px;
    height: 105px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid #ccc;
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
    font-size: 48px;
    color: var(--vt-c-white);
    font-weight: bold;
}

/* Информация */
.info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.info-row.primary {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ccc;
}

.user-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-heading);
}

.badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.badge {
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    border: 1px solid #ccc;
}

.badge.premium {
    background-color: #ffd700;
    color: #333;
    border-color: #ffed4e;
}

.badge.verified {
    background-color: #00b4d8;
    color: var(--vt-c-white);
    border-color: #0077b6;
}

.badge.bot {
    background-color: #a8dadc;
    color: #333;
    border-color: #457b9d;
}

.info-item {
    display: flex;
    gap: 6px;
    align-items: baseline;
    flex: 1;
    min-width: 140px;
}

.info-item.highlight {
    background-color: var(--color-background-soft);
    padding: 5px 10px;
    border-radius: 2px;
    border: 1px solid #ccc;
    display: inline-block;
}

.info-item.bio {
    flex-direction: column;
    align-items: flex-start;
}

.info-label {
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    font-size: 14px;
}

.info-value {
    color: var(--color-heading);
    font-weight: 500;
    font-size: 14px;
}

.info-value.phone {
    white-space: nowrap;
}

.info-value.status {
    color: #e74c3c;
}

.info-value.status.online {
    color: #27ae60;
    font-weight: 600;
}

.bio-text {
    margin: 4px 0 0 0;
    color: var(--color-text);
    line-height: 1.5;
    font-style: italic;
    font-size: 13px;
}

.info-additional {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 6px;
}

/* Адаптивность */
@media (max-width: 768px) {
    .card-content {
        flex-direction: column;
        align-items: center;
    }

    .avatar-section {
        align-items: center;
    }

    .avatar,
    .avatar-placeholder {
        width: 90px;
        height: 90px;
    }

    .avatar-letter {
        font-size: 38px;
    }

    .info-section {
        width: 100%;
    }

    .user-name {
        font-size: 18px;
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
        font-size: 16px;
    }

    .user-name {
        font-size: 16px;
    }

    .info-item {
        flex-direction: column;
        gap: 3px;
        align-items: flex-start;
    }

    .info-label {
        font-size: 13px;
    }

    .info-value {
        font-size: 13px;
    }
}
</style>
