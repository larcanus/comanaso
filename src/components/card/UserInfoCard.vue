<script setup>
import { computed, ref } from 'vue';
import useUserStore from '@/store/user.js';
import { getColorFromString, getFirstLetter } from '@/utils/colorUtils.js';

const userStore = useUserStore();

// Состояние раскрытия детальной информации
const isExpanded = ref(false);

function toggleExpanded() {
    isExpanded.value = !isExpanded.value;
}

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

        if (diffMins < 1) return 'был(а) только что';
        if (diffMins < 60) return `был(а) ${diffMins} мин. назад`;
        if (diffHours < 24) return `был(а) ${diffHours} ч. назад`;
        if (diffDays === 1) return 'был(а) вчера';
        if (diffDays < 7) return `был(а) ${diffDays} дн. назад`;

        return `был(а) ${date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })}`;
    }

    return 'был(а) давно';
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

// Форматирование значений Premium и Verified
const premiumText = computed(() => {
    return userStore.userIsPremium ? 'Да' : 'Нет';
});

const verifiedText = computed(() => {
    return userStore.userIsVerified ? 'Да' : 'Нет';
});

// Форматирование для детальной информации
const yesNoFormatter = (value) => (value ? 'Да' : 'Нет');

const detailedFields = computed(() => [
    {
        category: 'Социальные связи',
        fields: [
            { label: 'В контактах', value: yesNoFormatter(userStore.userIsContact) },
            {
                label: 'Взаимный контакт',
                value: yesNoFormatter(userStore.userIsMutualContact),
            },
            { label: 'Близкий друг', value: yesNoFormatter(userStore.userIsCloseFriend) },
            {
                label: 'Требуется Premium для связи',
                value: yesNoFormatter(userStore.userIsContactRequirePremium),
            },
        ],
    },
    {
        category: 'Истории (Stories)',
        fields: [
            { label: 'Истории скрыты', value: yesNoFormatter(userStore.userIsStoriesHidden) },
            {
                label: 'Истории недоступны',
                value: yesNoFormatter(userStore.userIsStoriesUnavailable),
            },
            {
                label: 'ID последней истории',
                value: userStore.userStoriesMaxId || 'Не указан',
            },
            { label: 'Есть активные истории', value: yesNoFormatter(userStore.hasStories) },
        ],
    },
    {
        category: 'Дополнительные юзернеймы',
        fields: [
            {
                label: 'Количество',
                value: userStore.userUsernames.length > 0 ? userStore.userUsernames.length : '0',
            },
            {
                label: 'Список',
                value:
                    userStore.userUsernames.length > 0
                        ? userStore.userUsernames.map((u) => `@${u}`).join(', ')
                        : 'Нет',
            },
        ],
    },
    {
        category: 'Визуальная кастомизация',
        fields: [
            { label: 'Emoji статус', value: userStore.userEmojiStatus || 'Не установлен' },
            { label: 'Цвет имени', value: userStore.userColor || 'По умолчанию' },
            { label: 'Цвет профиля', value: userStore.userProfileColor || 'По умолчанию' },
            {
                label: 'Кастомные цвета',
                value: yesNoFormatter(userStore.hasCustomColors),
            },
        ],
    },
    {
        category: 'Безопасность и ограничения',
        fields: [
            { label: 'Фейковый аккаунт', value: yesNoFormatter(userStore.userIsFake) },
            { label: 'Скам аккаунт', value: yesNoFormatter(userStore.userIsScam) },
            { label: 'Ограничен', value: yesNoFormatter(userStore.userIsRestricted) },
            {
                label: 'Причина ограничения',
                value: userStore.userRestrictionReason || 'Нет',
            },
            { label: 'Удален', value: yesNoFormatter(userStore.userIsDeleted) },
            {
                label: 'Официальная поддержка',
                value: yesNoFormatter(userStore.userIsSupport),
            },
        ],
    },
    {
        category: 'Техническая информация',
        fields: [
            { label: 'Дата-центр фото', value: userStore.photoDcId || 'Не указан' },
            { label: 'ID фото', value: userStore.userPhoto?.photoId || 'Нет фото' },
            {
                label: 'Видео в фото',
                value: userStore.userPhoto?.hasVideo ? 'Да' : 'Нет',
            },
        ],
    },
]);
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
                        <div class="user-name-container">
                            <h2 class="user-name">{{ userStore.fullName }}</h2>
                            <span v-if="userStore.userIsBot" class="bot-indicator" title="Бот">
                                🤖
                            </span>
                        </div>
                    </div>

                    <div class="info-row">
                        <div class="info-item highlight">
                            <span class="info-label">Т:</span>
                            <span class="info-value phone sub-margin">{{ formattedPhone }}</span>
                        </div>
                        <div class="info-item highlight">
                            <span class="info-label">ID:</span>
                            <span class="info-value sub-margin">{{ userStore.userId }}</span>
                        </div>
                    </div>
                </div>

                <!-- Дополнительная информация - сетка 2x2 -->
                <div class="info-additional">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Username:</span>
                            <span class="info-value">
                                {{ userStore.hasUsername ? `@${userStore.userName}` : 'Не указан' }}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Premium:</span>
                            <span
                                class="info-value"
                                :class="{
                                    'value-yes': userStore.userIsPremium,
                                    'value-no': !userStore.userIsPremium,
                                }"
                            >
                                {{ premiumText }}
                            </span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Язык:</span>
                            <span class="info-value">{{ languageName }}</span>
                        </div>

                        <div class="info-item">
                            <span class="info-label">Verified:</span>
                            <span
                                class="info-value"
                                :class="{
                                    'value-yes': userStore.userIsVerified,
                                    'value-no': !userStore.userIsVerified,
                                }"
                            >
                                {{ verifiedText }}
                            </span>
                        </div>
                    </div>

                    <!-- Статус отдельно -->
                    <div class="info-item status-row">
                        <span class="info-label">Статус:</span>
                        <span class="info-value status" :class="{ online: userStore.isOnline }">
                            {{ statusText }}
                        </span>
                    </div>

                    <!-- Биография -->
                    <div v-if="userStore.hasBio" class="info-item bio">
                        <span class="info-label">О себе:</span>
                        <p class="info-value bio-text">{{ userStore.userBio }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Кнопка "Подробно" -->
        <div class="card-actions">
            <button class="expand-button" @click="toggleExpanded">
                <span>{{ isExpanded ? 'Скрыть подробности' : 'Показать подробности' }}</span>
                <span class="expand-icon" :class="{ rotated: isExpanded }">▼</span>
            </button>
        </div>

        <!-- Детальная информация (раскрывающаяся секция) -->
        <transition name="expand">
            <div v-if="isExpanded" class="detailed-info">
                <div
                    v-for="category in detailedFields"
                    :key="category.category"
                    class="detail-category"
                >
                    <h4 class="category-title">{{ category.category }}</h4>
                    <div class="detail-grid">
                        <div
                            v-for="field in category.fields"
                            :key="field.label"
                            class="detail-item"
                        >
                            <span class="detail-label">{{ field.label }}:</span>
                            <span class="detail-value">{{ field.value }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    user-select: none;
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
    position: relative;
    user-select: none;
}

.avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
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
    user-select: none;
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
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ccc;
}

.user-name-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.user-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-heading);
}

.bot-indicator {
    font-size: 18px;
    line-height: 1;
    user-select: none;
}

.info-item {
    display: flex;
    gap: 6px;
    align-items: baseline;
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

.info-item.status-row {
    padding-top: 6px;
    border-top: 1px solid #e0e0e0;
}

.info-label {
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    font-size: 14px;
    user-select: none;
    cursor: default;
}

.info-value {
    color: var(--color-heading);
    font-weight: 500;
    font-size: 14px;
    user-select: text;
}

.info-value.phone {
    white-space: nowrap;
}

.info-value.sub-margin {
    margin-left: 5px;
}

.info-value.status {
    color: #e74c3c;
}

.info-value.status.online {
    color: #27ae60;
    font-weight: 600;
}

.info-value.value-yes {
    color: #27ae60;
    font-weight: 600;
}

.info-value.value-no {
    color: #e74c3c;
    font-weight: 500;
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
    gap: 8px;
    padding-top: 6px;
}

/* Сетка 2x2 для дополнительной информации */
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
}

/* Кнопка "Подробно" */
.card-actions {
    padding: 0 10px 10px;
    background-color: var(--color-background);
}

.expand-button {
    width: 100%;
    padding: 10px 15px;
    background-color: var(--vt-bt-background-color);
    color: var(--vt-c-white);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background-color 0.2s ease;
    user-select: none;
}

.expand-button:hover {
    background-color: var(--vt-bt-hover-background-color);
}

.expand-button:active {
    background-color: var(--vt-bt-active-background-color);
}

.expand-icon {
    font-size: 12px;
    transition: transform 0.3s ease;
}

.expand-icon.rotated {
    transform: rotate(180deg);
}

/* Детальная информация */
.detailed-info {
    padding: 15px;
    background-color: var(--color-background-mute);
    border-top: 1px solid #ccc;
}

.detail-category {
    margin-bottom: 20px;
}

.detail-category:last-child {
    margin-bottom: 0;
}

.category-title {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-heading);
    padding-bottom: 8px;
    border-bottom: 2px solid var(--vt-bt-background-color);
    user-select: none;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px 15px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px;
    background-color: var(--color-background);
    border-radius: 2px;
    border: 1px solid #e0e0e0;
}

.detail-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
}

.detail-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-heading);
    word-break: break-word;
    user-select: text;
}

/* Анимация раскрытия */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    max-height: 2000px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
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
    }

    .user-name-container {
        justify-content: center;
    }

    .info-row.primary {
        justify-content: center;
    }

    /* На мобильных делаем список */
    .info-grid {
        grid-template-columns: 1fr;
    }

    .detail-grid {
        grid-template-columns: 1fr;
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

    .category-title {
        font-size: 14px;
    }

    .detail-label {
        font-size: 11px;
    }

    .detail-value {
        font-size: 13px;
    }
}

.user-name {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-heading);
}

.bot-indicator {
    font-size: 18px;
    line-height: 1;
    user-select: none;
}

.info-item {
    display: flex;
    gap: 6px;
    align-items: baseline;
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

.info-item.status-row {
    padding-top: 6px;
    border-top: 1px solid #e0e0e0;
}

.info-label {
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    font-size: 14px;
    user-select: none;
    cursor: default;
}

.info-value {
    color: var(--color-heading);
    font-weight: 500;
    font-size: 14px;
    user-select: text;
}

.info-value.phone {
    white-space: nowrap;
}

.info-value.sub-margin {
    margin-left: 5px;
}

.info-value.status {
    color: #e74c3c;
}

.info-value.status.online {
    color: #27ae60;
    font-weight: 600;
}

.info-value.value-yes {
    color: #27ae60;
    font-weight: 600;
}

.info-value.value-no {
    color: #e74c3c;
    font-weight: 500;
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
    gap: 8px;
    padding-top: 6px;
}

/* Сетка 2x2 для дополнительной информации */
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
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
    }

    .user-name-container {
        justify-content: center;
    }

    .info-row.primary {
        justify-content: center;
    }

    /* На мобильных делаем список */
    .info-grid {
        grid-template-columns: 1fr;
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
