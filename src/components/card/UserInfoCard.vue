<script setup>
import { computed, ref } from 'vue';
import useUserStore from '@/store/user.js';
import { getColorFromString, getFirstLetter } from '@/utils/colorUtils.js';
import DetailPopup from '@/components/modal/DetailPopup.vue';

const userStore = useUserStore();

const isExpanded = ref(false);

function toggleExpanded() {
    isExpanded.value = !isExpanded.value;
}

const isPopupVisible = ref(false);
const popupMessage = ref({ title: '', desc: '' });

function showFieldInfo(label, description) {
    popupMessage.value = {
        title: label,
        desc: description,
    };
    isPopupVisible.value = true;
}

function closePopup() {
    isPopupVisible.value = false;
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
            {
                label: 'В контактах',
                value: yesNoFormatter(userStore.userIsContact),
                description:
                    'Показывает, добавлен ли пользователь в ваш список контактов.\n\nВозможные значения:\n• Да - пользователь в контактах\n• Нет - не добавлен',
            },
            {
                label: 'Взаимный контакт',
                value: yesNoFormatter(userStore.userIsMutualContact),
                description:
                    'Взаимный контакт означает, что вы добавили друг друга в контакты.\n\nЭто важный показатель для анализа социальных связей - такие контакты обычно являются реальными знакомыми.\n\nВозможные значения:\n• Да - взаимные контакты\n• Нет - только с одной стороны',
            },
            {
                label: 'Близкий друг',
                value: yesNoFormatter(userStore.userIsCloseFriend),
                description:
                    'Функция Telegram, позволяющая отметить определенных пользователей как близких друзей.\n\nТакие пользователи могут иметь приоритет в уведомлениях и видеть специальный контент.\n\nВозможные значения:\n• Да - отмечен как близкий друг\n• Нет - обычный контакт',
            },
            {
                label: 'Требуется Premium для связи',
                value: yesNoFormatter(userStore.userIsContactRequirePremium),
                description:
                    'Настройка приватности Telegram Premium.\n\nПользователи с Premium могут ограничить возможность связи только для других Premium-пользователей.\n\nВозможные значения:\n• Да - нужна Premium подписка для контакта\n• Нет - доступен для всех',
            },
        ],
    },
    {
        category: 'Истории (Stories)',
        fields: [
            {
                label: 'Истории скрыты',
                value: yesNoFormatter(userStore.userIsStoriesHidden),
                description:
                    'Настройка приватности историй (Stories) в Telegram.\n\nЕсли включено, истории этого пользователя не отображаются в вашей ленте.\n\nВозможные значения:\n• Да - истории скрыты от вас\n• Нет - истории видны',
            },
            {
                label: 'Истории недоступны',
                value: yesNoFormatter(userStore.userIsStoriesUnavailable),
                description:
                    'Показывает техническую доступность историй.\n\nМожет быть недоступно из-за:\n• Настроек приватности пользователя\n• Блокировки\n• Отключения функции\n\nВозможные значения:\n• Да - истории недоступны\n• Нет - истории доступны',
            },
            {
                label: 'ID последней истории',
                value: userStore.userStoriesMaxId || 'Не указан',
                description:
                    'Уникальный идентификатор последней опубликованной истории.\n\nПолезно для:\n• Отслеживания активности\n• Определения времени последней публикации\n• Технического анализа\n\nФормат: числовой ID или "Не указан"',
            },
            {
                label: 'Есть активные истории',
                value: yesNoFormatter(userStore.hasStories),
                description:
                    'Показывает наличие активных (не просмотренных или не истекших) историй.\n\nИстории в Telegram доступны 24 часа.\n\nВозможные значения:\n• Да - есть активные истории\n• Нет - нет активных историй',
            },
        ],
    },
    {
        category: 'Дополнительные юзернеймы',
        fields: [
            {
                label: 'Количество',
                value: userStore.userUsernames.length > 0 ? userStore.userUsernames.length : '0',
                description:
                    'С февраля 2023 года Telegram позволяет иметь несколько публичных юзернеймов (@username).\n\nЭто полезно для:\n• Бизнес-аккаунтов с разными направлениями\n• Брендов с несколькими проектами\n• Повышения узнаваемости\n\nМаксимум: до 10 дополнительных юзернеймов',
            },
            {
                label: 'Список',
                value:
                    userStore.userUsernames.length > 0
                        ? userStore.userUsernames.map((u) => `@${u}`).join(', ')
                        : 'Нет',
                description:
                    'Полный список всех дополнительных юзернеймов пользователя.\n\nКаждый юзернейм:\n• Должен быть уникальным в Telegram\n• Может содержать буквы, цифры и подчёркивания\n• Минимум 5 символов\n\nВсе юзернеймы ведут к одному профилю.',
            },
        ],
    },
    {
        category: 'Визуальная кастомизация',
        fields: [
            {
                label: 'Emoji статус',
                value: userStore.userEmojiStatus || 'Не установлен',
                description:
                    'Функция Telegram Premium - эмодзи рядом с именем пользователя.\n\nМожет показывать:\n• Настроение\n• Статус занятости\n• Индивидуальность\n\nДоступно только для Premium-пользователей.\n\nФормат: эмодзи или "Не установлен"',
            },
            {
                label: 'Цвет имени',
                value: userStore.userColor || 'По умолчанию',
                description:
                    'Цвет отображения имени пользователя в чатах (название профиля).\n\nТелеграм использует 8 предустановленных цветов для разнообразия интерфейса.\n\nЦвет назначается автоматически на основе ID пользователя.\n\nФормат: числовой код цвета или "По умолчанию"',
            },
            {
                label: 'Цвет профиля',
                value: userStore.userProfileColor || 'По умолчанию',
                description:
                    'Цвет оформления страницы профиля пользователя (фон шапки профиля).\n\nPremium-функция позволяет выбрать собственный цвет оформления.\n\nОбычные пользователи используют цвет по умолчанию.\n\nФормат: код цвета или "По умолчанию"',
            },
            {
                label: 'Кастомные цвета',
                value: yesNoFormatter(userStore.hasCustomColors),
                description:
                    'Показывает, использует ли пользователь кастомные цвета для имени или профиля.\n\nЭто Premium-функция Telegram.\n\nПолезно для:\n• Определения Premium-пользователей\n• Анализа активности персонализации\n\nВозможные значения:\n• Да - использует кастомные цвета\n• Нет - стандартные цвета',
            },
        ],
    },
    {
        category: 'Безопасность и ограничения',
        fields: [
            {
                label: 'Фейковый аккаунт',
                value: yesNoFormatter(userStore.userIsFake),
                description:
                    'Отметка Telegram о подозрительной активности аккаунта.\n\nПричины пометки:\n• Массовые рассылки спама\n• Накрутка подписчиков\n• Подозрительное поведение\n\n⚠️ Взаимодействие с такими аккаунтами может быть рискованным.\n\nВозможные значения:\n• Да - помечен как фейковый\n• Нет - обычный аккаунт',
            },
            {
                label: 'Скам аккаунт',
                value: yesNoFormatter(userStore.userIsScam),
                description:
                    'Официальная метка Telegram о мошенническом аккаунте.\n\nПризнаки скама:\n• Фишинговые ссылки\n• Финансовое мошенничество\n• Выдача себя за другое лицо\n\n⚠️ Крайне не рекомендуется взаимодействовать с такими аккаунтами.\n\nВозможные значения:\n• Да - подтвержденный скам\n• Нет - чистый аккаунт',
            },
            {
                label: 'Ограничен',
                value: yesNoFormatter(userStore.userIsRestricted),
                description:
                    'Показывает, наложены ли ограничения на аккаунт модерацией Telegram.\n\nОграничения могут включать:\n• Запрет на публичные группы\n• Ограничение отправки сообщений\n• Блокировка определенных функций\n\nВозможные значения:\n• Да - есть ограничения\n• Нет - полный доступ',
            },
            {
                label: 'Причина ограничения',
                value: userStore.userRestrictionReason || 'Нет',
                description:
                    'Официальная причина ограничений от модерации Telegram.\n\nВозможные причины:\n• Спам\n• Нарушение правил сообщества\n• Жалобы пользователей\n• Распространение запрещенного контента\n\nФормат: текстовое описание или "Нет"',
            },
            {
                label: 'Удален',
                value: yesNoFormatter(userStore.userIsDeleted),
                description:
                    'Показывает, удален ли аккаунт пользователем или администрацией Telegram.\n\nУдаленный аккаунт:\n• Недоступен для контакта\n• Отображается как "Deleted Account"\n• Потерял всю персональную информацию\n\nВозможные значения:\n• Да - аккаунт удален\n• Нет - активный аккаунт',
            },
            {
                label: 'Официальная поддержка',
                value: yesNoFormatter(userStore.userIsSupport),
                description:
                    'Официальный аккаунт технической поддержки Telegram.\n\nПризнаки:\n• Специальная верификация\n• Прямая связь с командой Telegram\n• Помощь пользователям\n\n⚠️ Будьте осторожны: мошенники могут выдавать себя за поддержку.\n\nВозможные значения:\n• Да - официальная поддержка\n• Нет - обычный пользователь',
            },
        ],
    },
    {
        category: 'Техническая информация',
        fields: [
            {
                label: 'Дата-центр фото',
                value: userStore.photoDcId || 'Не указан',
                description:
                    'ID дата-центра Telegram, где хранится фотография профиля.\n\nTelegram использует 5 основных дата-центров:\n• DC1-DC5 (разные географические локации)\n\nЭта информация полезна для:\n• Технического анализа\n• Определения географии серверов\n• Оптимизации загрузки\n\nФормат: число 1-5 или "Не указан"',
            },
            {
                label: 'ID фото',
                value: userStore.userPhoto?.photoId || 'Нет фото',
                description:
                    'Уникальный идентификатор фотографии профиля пользователя.\n\nКаждое фото имеет уникальный ID для:\n• Кэширования\n• Загрузки\n• Версионирования\n\nПри смене фото ID меняется.\n\nФормат: длинное числовое значение или "Нет фото"',
            },
            {
                label: 'Видео в фото',
                value: userStore.userPhoto?.hasVideo ? 'Да' : 'Нет',
                description:
                    'Показывает, является ли фото профиля анимированным (видео).\n\nС 2021 года Telegram позволяет устанавливать короткие видео вместо статичной фотографии профиля.\n\nОсобенности:\n• Длительность до 10 секунд\n• Зацикленное воспроизведение\n• Премиум-функция\n\nВозможные значения:\n• Да - анимированное фото\n• Нет - статичное изображение',
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
                            <div class="detail-header">
                                <span class="detail-label">{{ field.label }}:</span>
                                <button
                                    class="info-icon"
                                    title="Подробная информация"
                                    @click="showFieldInfo(field.label, field.description)"
                                >
                                    ?
                                </button>
                            </div>
                            <span class="detail-value">{{ field.value }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <DetailPopup :message="popupMessage" :is-visible="isPopupVisible" @close="closePopup" />
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
    background-color: var(--vt-bt-info-background-color-hover);
}

.expand-button:active {
    background-color: var(--vt-bt-info-background-color);
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
    position: relative;
}

.detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.detail-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
    flex: 1;
}

.info-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid var(--color-text);
    background-color: transparent;
    color: var(--color-text);
    font-size: 11px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    flex-shrink: 0;
    user-select: none;
}

.info-icon:hover {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-c-white);
}

.info-icon:active {
    transform: scale(0.95);
}

.detail-value {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-heading);
    word-break: break-word;
    user-select: text;
}

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
