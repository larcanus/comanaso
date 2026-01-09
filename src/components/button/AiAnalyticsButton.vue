<script setup>
import { ref, computed, toRaw } from 'vue';
import { analyticsService } from '@/services/analytics.service.js';
import { authService } from '@/services/auth.service.js';
import { parseMarkdown } from '@/utils/markdownParser.js';
import useDialogStore from '@/store/dialogs.js';
import useUserStore from '@/store/user.js';
import useToastStore from '@/store/toast.js';
import useAuthStore from '@/store/auth.js';

const dialogStore = useDialogStore();
const userStore = useUserStore();
const toastStore = useToastStore();
const authStore = useAuthStore();

// Состояния компонента
const isExpanded = ref(false);
const isLoading = ref(false);
const aiResponse = ref('');
const errorMessage = ref('');

// Проверяем, есть ли данные для анализа
const hasDataForAnalysis = computed(() => {
    return dialogStore.state?.length > 0 && userStore.hasUser;
});

// Получаем последние сообщения из нормализованных диалогов
const getRecentMessages = () => {
    // Получаем нормализованные диалоги из store
    const normalizedDialogs = dialogStore.getPreparedDialogs();

    // Берем до 50 последних диалогов
    return normalizedDialogs.slice(0, 50).map((dialog) => ({
        dialogId: dialog.id,
        dialogTitle: dialog.title,
        dialogType: dialog.type,

        // Информация о последнем сообщении
        lastMessage: dialog.lastMessage
            ? {
                  text: dialog.lastMessage.text,
                  date: dialog.lastMessage.date,
                  isOutgoing: dialog.lastMessage.out,
                  mediaType: dialog.lastMessage.mediaType,
              }
            : null,

        // Метаданные диалога
        isPinned: dialog.pinned,
        isArchived: dialog.archived,
        isMuted: dialog.muted,
        unreadCount: dialog.unreadCount,
        unreadMark: dialog.unreadMark,

        // Информация о папке
        // folderId: dialog.folderId,
        folderName: dialog.folderName,

        // Черновик
        draft: dialog.draft,

        // Дополнительная информация об entity
        // entityInfo: dialog.entity
        //     ? {
        //           username: dialog.entity.username,
        //           isBot: dialog.entity.isBot,
        //           isVerified: dialog.entity.isVerified,
        //           isPremium: dialog.entity.isPremium,
        //           participantsCount: dialog.entity.participantsCount,
        //       }
        //     : null,
    }));
};

// Получаем полную информацию о пользователе
const getUserInfo = () => {
    if (!userStore.hasUser) return null;

    return {
        // Основная информация
        id: userStore.id || 0,
        username: userStore.username || '',
        firstName: userStore.firstName || '',
        lastName: userStore.lastName || '',
        phone: userStore.phone || '',
        bio: userStore.bio || '',

        // Статус и активность
        isOnline: userStore.isOnline || false,
        lastSeen: userStore.lastSeen ? userStore.lastSeen.toISOString() : null,
        status: userStore.status ? toRaw(userStore.status) : null,

        // Флаги аккаунта
        isBot: userStore.isBot || false,
        isPremium: userStore.isPremium || false,
        isVerified: userStore.isVerified || false,
        isFake: userStore.isFake || false,
        isScam: userStore.isScam || false,
        isDeleted: userStore.isDeleted || false,
        isSupport: userStore.isSupport || false,

        // Социальные связи
        isContact: userStore.isContact || false,
        isMutualContact: userStore.isMutualContact || false,
        isCloseFriend: userStore.isCloseFriend || false,

        // Дополнительные данные
        // langCode: userStore.langCode || null,
        usernames: userStore.usernames?.length > 0 ? userStore.usernames : [],
        emojiStatus: userStore.emojiStatus || null,
        color: userStore.color || null,
        profileColor: userStore.profileColor || null,

        // Истории
        hasStories: userStore.hasStories || false,
        isStoriesHidden: userStore.isStoriesHidden || false,
        storiesMaxId: userStore.storiesMaxId || null,

        // Ограничения
        isRestricted: userStore.isRestricted || false,
        restrictionReason: userStore.restrictionReason || null,
    };
};

// Получаем детальную информацию о папках
const getFolders = () => {
    const folders = dialogStore.foldersState.rawFoldersData || [];
    return folders.map((folder) => ({
        id: folder.id,
        name: folder.title,
        description: folder.description || '',
        chats: dialogStore.foldersState.dialogsIdByFolderId[folder.id]?.length || 0,
        includedChatIds: folder.includedChatIds || [],
        excludedChatIds: folder.excludedChatIds || [],
        isDefault: folder.isDefault || false,
        icon: folder.icon || null,
        color: folder.color || null,
    }));
};

// Получаем статистику по диалогам
const getDialogsStats = () => {
    const normalizedDialogs = dialogStore.getPreparedDialogs();

    const stats = {
        total: normalizedDialogs.length,
        byType: {},
        pinned: 0,
        archived: 0,
        muted: 0,
        unreadTotal: 0,
        withDrafts: 0,
    };

    normalizedDialogs.forEach((dialog) => {
        // Подсчет по типам
        stats.byType[dialog.type] = (stats.byType[dialog.type] || 0) + 1;

        // Подсчет различных состояний
        if (dialog.pinned) stats.pinned++;
        if (dialog.archived) stats.archived++;
        if (dialog.muted) stats.muted++;
        if (dialog.draft) stats.withDrafts++;
        if (dialog.unreadCount > 0) stats.unreadTotal += dialog.unreadCount;
    });

    return stats;
};

// Фильтруем данные по настройкам приватности
const filterDataByPrivacySettings = async (data) => {
    try {
        // Получаем актуальные настройки пользователя
        const settings = (await updateUserSettings()) || {};

        const filteredData = { ...data };
        console.log('settings', settings);
        console.log('data', data);
        console.log('filteredData', filteredData);

        // Фильтруем userInfo
        if (filteredData.userInfo) {
            if (!settings.shareUserName) {
                delete filteredData.userInfo.firstName;
                delete filteredData.userInfo.lastName;
            }
            if (!settings.shareNickname) {
                delete filteredData.userInfo.username;
                delete filteredData.userInfo.usernames;
            }
        }

        // Фильтруем recentMessages
        if (filteredData.recentMessages && !settings.shareMessageText) {
            filteredData.recentMessages = filteredData.recentMessages.map((msg) => ({
                ...msg,
                lastMessage: msg.lastMessage
                    ? {
                          ...msg.lastMessage,
                          text: '[сообщение скрыто]',
                      }
                    : null,
                draft: msg.draft
                    ? {
                          ...msg.draft,
                          text: '[черновик скрыт]',
                      }
                    : null,
            }));
        }

        // Фильтруем информацию о диалогах в сообщениях
        if (filteredData.recentMessages && !settings.shareDialogTitles) {
            filteredData.recentMessages = filteredData.recentMessages.map((msg) => ({
                ...msg,
                dialogTitle: '[название диалога скрыто]',
            }));
        }

        return filteredData;
    } catch (error) {
        console.error('Ошибка при фильтрации данных:', error);
        return data;
    }
};

// обновление данных пользователя с сервера
const updateUserSettings = async () => {
    try {
        const userData = await authService.getCurrentUser();
        authStore.setUser(userData);

        if (userData.settings) {
            return userData.settings;
        }
        return null;
    } catch (error) {
        console.error('Load user settings error:', error);
        toastStore.addToast('error', error.userMessage || 'Не удалось загрузить настройки');
        return null;
    }
};

// Основная функция для запуска AI анализа
const runAiAnalysis = async () => {
    if (!hasDataForAnalysis.value) {
        toastStore.addToast('warning', 'Нет данных для AI анализа');
        return;
    }

    isLoading.value = true;
    aiResponse.value = '';
    errorMessage.value = '';
    isExpanded.value = true;

    try {
        // Собираем полные данные
        const telegramData = {
            recentMessages: getRecentMessages(),
            userInfo: getUserInfo(),
            folders: getFolders(),
            dialogsStats: getDialogsStats(),
            metadata: {
                totalDialogs: dialogStore.state?.length || 0,
                totalFolders: dialogStore.foldersState.rawFoldersData?.length || 0,
                collectedAt: new Date().toISOString(),
                dataVersion: '2.0', // Увеличиваем версию данных
            },
        };

        console.log('Отправляемые данные для AI анализа:', {
            messagesCount: telegramData.recentMessages.length,
            userInfoFields: Object.keys(telegramData.userInfo || {}).length,
            foldersCount: telegramData.folders.length,
            stats: telegramData.dialogsStats,
        });

        // Фильтруем по настройкам приватности
        const filteredData = await filterDataByPrivacySettings(telegramData);

        console.log('Отфильтрованные данные:', {
            messagesCount: filteredData.recentMessages?.length || 0,
            userInfoFields: Object.keys(filteredData.userInfo || {}).length,
            foldersCount: filteredData.folders?.length || 0,
        });

        // Запускаем AI анализ
        await analyticsService.getAiAnalysis(filteredData, (chunk) => {
            if (chunk.content) {
                aiResponse.value += chunk.content;
            }
        });

        toastStore.addToast('success', 'AI анализ завершен');
    } catch (error) {
        console.error('Ошибка AI анализа:', error);
        errorMessage.value = error.userMessage || 'Произошла ошибка при анализе данных';
        toastStore.addToast('error', errorMessage.value);
    } finally {
        isLoading.value = false;
    }
};

// Сворачиваем/разворачиваем панель
const togglePanel = () => {
    if (!isExpanded.value && !aiResponse.value) {
        runAiAnalysis();
    } else {
        isExpanded.value = !isExpanded.value;
    }
};

// Очищаем ответ
const clearResponse = () => {
    aiResponse.value = '';
    errorMessage.value = '';
};

// Преобразуем markdown в HTML
const parsedResponse = computed(() => {
    return parseMarkdown(aiResponse.value);
});
</script>

<template>
    <div class="ai-analytics-container">
        <button
            class="ai-analytics-button"
            :class="{ expanded: isExpanded, loading: isLoading }"
            :disabled="!hasDataForAnalysis && !isExpanded"
            @click="togglePanel"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
                <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
                <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
            </svg>
            <span class="button-text">
                {{ isLoading ? 'Анализирую...' : 'AI Анализ' }}
            </span>
            <span class="button-arrow">{{ isExpanded ? '▼' : '▶' }}</span>
        </button>

        <div v-if="isExpanded" class="ai-response-panel">
            <div class="panel-header">
                <h3>AI Анализ вашего Telegram</h3>
                <button class="clear-button" title="Очистить" @click="clearResponse">🗑️</button>
            </div>

            <div v-if="errorMessage" class="error-message">
                {{ errorMessage }}
            </div>

            <div v-if="isLoading && !aiResponse" class="loading-placeholder">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p>AI анализирует ваши данные Telegram...</p>
            </div>

            <div v-if="aiResponse" class="ai-response-content">
                <div class="response-text markdown-content" v-html="parsedResponse"></div>
            </div>

            <div v-if="!isLoading && !aiResponse && !errorMessage" class="empty-state">
                <p>Нажмите кнопку выше для запуска AI анализа</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ai-analytics-container {
    width: 100%;
    max-width: 750px;
    margin: 20px auto;
}

.ai-analytics-button {
    width: 100%;
    padding: 15px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 2px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.ai-analytics-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.ai-analytics-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.ai-analytics-button.expanded {
    border-radius: 2px 2px 0 0;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.ai-analytics-button.loading {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
}

.button-text {
    flex-grow: 1;
    text-align: center;
}

.button-arrow {
    font-size: 12px;
    opacity: 0.8;
}

.ai-response-panel {
    background: rgba(44, 62, 80, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
    border-radius: 0 0 2px 2px;
    padding: 20px;
    backdrop-filter: blur(10px);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    color: #e3e2e2;
}

.clear-button {
    background: transparent;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    border-radius: 2px;
    transition: all 0.2s ease;
}

.clear-button:hover {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
}

.error-message {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 2px;
    padding: 15px;
    color: #ff6b6b;
    margin-bottom: 15px;
}

.loading-placeholder {
    text-align: center;
    padding: 30px 0;
}

.loading-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 15px;
}

.loading-dots span {
    width: 10px;
    height: 10px;
    background: #667eea;
    border-radius: 50%;
    animation: pulse 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes pulse {
    0%,
    80%,
    100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.loading-placeholder p {
    color: #999;
    margin: 0;
}

.ai-response-content {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.response-text {
    color: #e3e2e2;
    line-height: 1.6;
    white-space: pre-wrap;
    font-size: 14px;
}

.empty-state {
    text-align: center;
    padding: 30px 0;
    color: #999;
}

/* Стили для markdown */
.markdown-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.7;
    color: #e3e2e2;
    letter-spacing: 0.01em;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4 {
    margin-top: 1.8em;
    margin-bottom: 0.8em;
    font-weight: 700;
    color: #ffffff;
    position: relative;
}

.markdown-content h1 {
    font-size: 2em;
    border-bottom: 3px solid rgba(102, 126, 234, 0.7);
    padding-bottom: 0.4em;
    margin-top: 0.5em;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.markdown-content h2 {
    font-size: 1.6em;
    border-left: 4px solid #667eea;
    padding-left: 0.8em;
    margin-left: -0.8em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    background: rgba(102, 126, 234, 0.08);
    border-radius: 0 4px 4px 0;
}

.markdown-content h3 {
    font-size: 1.3em;
    color: #a5b4fc;
    padding-bottom: 0.3em;
    border-bottom: 2px dashed rgba(165, 180, 252, 0.3);
}

.markdown-content h4 {
    font-size: 1.1em;
    color: #c7d2fe;
    padding-left: 0.5em;
    position: relative;
}

.markdown-content h4::before {
    content: '▸';
    position: absolute;
    left: -0.5em;
    color: #667eea;
    font-size: 1.2em;
}

.markdown-content p {
    margin-bottom: 1.2em;
    text-align: justify;
    hyphens: auto;
}

.markdown-content ul,
.markdown-content ol {
    margin-left: 1.8em;
    margin-bottom: 1.5em;
    padding-left: 0.5em;
}

.markdown-content li {
    margin-bottom: 0.7em;
    position: relative;
    padding-left: 0.3em;
}

.markdown-content ul li::before {
    content: '•';
    color: #667eea;
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
    font-size: 1.2em;
}

.markdown-content ol {
    counter-reset: list-counter;
}

.markdown-content ol li {
    counter-increment: list-counter;
}

.markdown-content ol li::before {
    content: counter(list-counter) '.';
    color: #764ba2;
    font-weight: bold;
    display: inline-block;
    width: 1.5em;
    margin-left: -1.5em;
}

.markdown-content strong {
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    padding: 0 0.1em;
}

.markdown-content em {
    font-style: italic;
    color: #d1d5db;
    background: rgba(255, 255, 255, 0.05);
    padding: 0 0.2em;
    border-radius: 2px;
}

.markdown-content code {
    background: rgba(0, 0, 0, 0.4);
    padding: 0.2em 0.5em;
    border-radius: 4px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.2);
}

.markdown-content pre {
    background: rgba(0, 0, 0, 0.5);
    padding: 1.2em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5em 0;
    border-left: 4px solid #667eea;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.markdown-content pre code {
    background: transparent;
    padding: 0;
    color: #e3e2e2;
    border: none;
    font-size: 0.95em;
}

.markdown-content a {
    color: #667eea;
    text-decoration: none;
    border-bottom: 2px solid rgba(102, 126, 234, 0.4);
    padding-bottom: 1px;
    transition: all 0.2s ease;
    font-weight: 500;
}

.markdown-content a:hover {
    color: #764ba2;
    border-bottom-color: #764ba2;
    background: rgba(102, 126, 234, 0.1);
    padding: 0.1em 0.3em;
    border-radius: 3px;
}

.markdown-content blockquote {
    border-left: 4px solid #667eea;
    padding: 1em 1.5em;
    margin: 1.5em 0;
    background: rgba(102, 126, 234, 0.08);
    border-radius: 0 8px 8px 0;
    color: #cbd5e1;
    font-style: italic;
    position: relative;
}

.markdown-content blockquote::before {
    content: '"';
    position: absolute;
    top: -0.5em;
    left: 0.5em;
    font-size: 3em;
    color: rgba(102, 126, 234, 0.2);
    font-family: Georgia, serif;
}

.markdown-content hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
    margin: 2.5em 0;
}

/* Специальные стили для списков с отступами */
.markdown-content ul ul,
.markdown-content ol ol,
.markdown-content ul ol,
.markdown-content ol ul {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    margin-left: 1.5em;
}

/* Стили для вложенных списков */
.markdown-content ul ul li::before {
    content: '◦';
    color: #764ba2;
}

.markdown-content ul ul ul li::before {
    content: '▪';
    color: #a5b4fc;
}

/* Улучшенные отступы для параграфов после заголовков */
.markdown-content h1 + p,
.markdown-content h2 + p,
.markdown-content h3 + p,
.markdown-content h4 + p {
    margin-top: 0.5em;
}

/* Стили для выделенных блоков */
.markdown-content > *:first-child {
    margin-top: 0;
}

.markdown-content > *:last-child {
    margin-bottom: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
    .ai-analytics-container {
        margin: 15px auto;
    }

    .ai-analytics-button {
        padding: 12px 15px;
        font-size: 14px;
    }

    .ai-response-panel {
        padding: 15px;
    }

    .ai-response-content {
        max-height: 300px;
        padding: 15px;
    }

    .markdown-content {
        font-size: 13px;
    }

    .markdown-content h1 {
        font-size: 1.5em;
    }

    .markdown-content h2 {
        font-size: 1.3em;
    }

    .markdown-content h3 {
        font-size: 1.1em;
    }
}
</style>
