<script setup>
import { ref, computed } from 'vue';
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
    console.log('dialogStore.state', dialogStore.state);
    return dialogStore.state?.length > 0 && userStore.hasUser;
});

// Получаем последние сообщения (примерно 20 последних)
const getRecentMessages = () => {
    const allDialogs = dialogStore.state || [];
    const messages = [];

    // Берем последние 20 диалогов и извлекаем последние сообщения
    allDialogs.slice(0, 20).forEach((dialog) => {
        if (dialog.lastMessage) {
            messages.push({
                id: dialog.id,
                text: dialog.lastMessage.text || '',
                date: dialog.lastMessage.date || new Date().toISOString(),
            });
        }
    });

    return messages;
};

// Получаем информацию о пользователе
const getUserInfo = () => {
    const user = userStore.hasUser;
    if (!user) return null;

    return {
        username: userStore.username || '',
        firstName: userStore.firstName || '',
        lastName: userStore.lastName || '',
        bio: userStore.bio || '',
        phone: userStore.phone || '',
        id: userStore.id || 0,
    };
};

// Получаем папки
const getFolders = () => {
    const folders = dialogStore.foldersState.rawFoldersData || [];
    return folders.map((folder) => ({
        name: folder.title,
        chats: dialogStore.foldersState.dialogsIdByFolderId[folder.id]?.length || 0,
        id: folder.id,
    }));
};

// Фильтруем данные по настройкам приватности
const filterDataByPrivacySettings = async (data) => {
    try {
        // Получаем актуальные настройки пользователя
        const userData = await updateUserSettings();
        const settings = userData.settings || {};

        const filteredData = { ...data };

        // Фильтруем userInfo
        if (filteredData.userInfo) {
            if (!settings.shareUserName) {
                delete filteredData.userInfo.firstName;
                delete filteredData.userInfo.lastName;
            }
            if (!settings.shareNickname) {
                delete filteredData.userInfo.username;
            }
        }

        // Фильтруем recentMessages
        if (filteredData.recentMessages && !settings.shareMessageText) {
            filteredData.recentMessages = filteredData.recentMessages.map((msg) => ({
                ...msg,
                text: '[сообщение скрыто]',
            }));
        }

        // Фильтруем folders (названия папок)
        if (filteredData.folders && !settings.shareDialogTitles) {
            filteredData.folders = filteredData.folders.map((folder) => ({
                ...folder,
                name: '[папка скрыта]',
            }));
        }

        return filteredData;
    } catch (error) {
        console.error('Ошибка при фильтрации данных:', error);
        return data; // Возвращаем исходные данные в случае ошибки
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
        // Собираем данные
        const telegramData = {
            recentMessages: getRecentMessages(),
            userInfo: getUserInfo(),
            folders: getFolders(),
        };

        // Фильтруем по настройкам приватности
        const filteredData = await filterDataByPrivacySettings(telegramData);

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
                <div
                    class="response-text markdown-content"
                    v-html="parsedResponse"
                ></div>
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

.button-icon {
    font-size: 20px;
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
    line-height: 1.6;
    color: #e3e2e2;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    font-weight: 600;
    color: #ffffff;
}

.markdown-content h1 {
    font-size: 1.8em;
    border-bottom: 2px solid rgba(102, 126, 234, 0.5);
    padding-bottom: 0.3em;
}

.markdown-content h2 {
    font-size: 1.5em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.2em;
}

.markdown-content h3 {
    font-size: 1.2em;
}

.markdown-content p {
    margin-bottom: 1em;
}

.markdown-content ul,
.markdown-content ol {
    margin-left: 1.5em;
    margin-bottom: 1em;
}

.markdown-content li {
    margin-bottom: 0.5em;
}

.markdown-content li::marker {
    color: #667eea;
}

.markdown-content strong {
    font-weight: 700;
    color: #ffffff;
}

.markdown-content em {
    font-style: italic;
    color: #d1d5db;
}

.markdown-content code {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
    color: #fbbf24;
}

.markdown-content pre {
    background: rgba(0, 0, 0, 0.4);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
    border-left: 3px solid #667eea;
}

.markdown-content pre code {
    background: transparent;
    padding: 0;
    color: #e3e2e2;
}

.markdown-content a {
    color: #667eea;
    text-decoration: none;
    border-bottom: 1px solid rgba(102, 126, 234, 0.3);
    transition: all 0.2s ease;
}

.markdown-content a:hover {
    color: #764ba2;
    border-bottom-color: #764ba2;
}

.markdown-content blockquote {
    border-left: 4px solid #667eea;
    padding-left: 1em;
    margin-left: 0;
    margin-right: 0;
    color: #9ca3af;
    font-style: italic;
}

.markdown-content hr {
    border: none;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 2em 0;
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
