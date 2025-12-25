<script setup>
import { ref, computed } from 'vue';
import useDialogStore from '@/store/dialogs.js';
import DetailPopup from '@/components/modal/DetailPopup.vue';

const dialogStore = useDialogStore();

const folders = computed(() => dialogStore.foldersState.rawFoldersData || []);
const hasFolders = computed(() => folders.value.length > 0);

const isPopupVisible = ref(false);
const popupMessage = ref(null);

function getFolderIcon(folder) {
    return folder.emoji || '📁';
}

function getUnreadCount(folder) {
    const dialogIds = dialogStore.foldersState.dialogsIdByFolderId[folder.id] || [];
    const allDialogs = dialogStore.state || [];

    let unreadCount = 0;
    dialogIds.forEach(dialogId => {
        const dialog = allDialogs.find(d => String(d.id) === String(dialogId));
        if (dialog?.unreadCount) {
            unreadCount += dialog.unreadCount;
        }
    });

    return unreadCount;
}

function showFolderDetails(folder) {
    const dialogsCount = dialogStore.foldersState.dialogsIdByFolderId[folder.id]?.length || 0;
    const unreadCount = getUnreadCount(folder);

    const details = [
        `ID: ${folder.id}`,
        `Диалогов в папке: ${dialogsCount}`,
        `Непрочитанных: ${unreadCount}`,
        '',
        '⚙️ Настройки фильтра:',
        `• Контакты: ${folder.contacts ? '✅ Да' : '❌ Нет'}`,
        `• Группы: ${folder.groups ? '✅ Да' : '❌ Нет'}`,
        `• Каналы: ${folder.broadcasts ? '✅ Да' : '❌ Нет'}`,
        `• Боты: ${folder.bots ? '✅ Да' : '❌ Nет'}`,
        `• Исключить прочитанные: ${folder.excludeRead ? '✅ Да' : '❌ Нет'}`,
        `• Исключить заглушенные: ${folder.excludeMuted ? '✅ Да' : '❌ Нет'}`,
        `• Исключить архивные: ${folder.excludeArchived ? '✅ Да' : '❌ Нет'}`,
    ];

    // Добавляем информацию о закрепленных чатах
    if (folder.pinnedChatIds && folder.pinnedChatIds.length > 0) {
        details.push('');
        details.push(`Закрепленных чатов: ${folder.pinnedChatIds.length}`);
    }

    // Добавляем информацию об исключенных чатах
    if (folder.excludedChatIds && folder.excludedChatIds.length > 0) {
        details.push('');
        details.push(`Исключенных чатов: ${folder.excludedChatIds.length}`);
    }

    popupMessage.value = {
        title: `Папка: ${folder.title}`,
        desc: details.join('\n'),
    };
    isPopupVisible.value = true;
}

function closePopup() {
    isPopupVisible.value = false;
}
</script>

<template>
    <div v-if="hasFolders" class="folder-cards-container">
        <div class="folder-grid">
            <div
                v-for="(folder) in folders"
                :key="folder.id"
                class="folder-card"
                @click="showFolderDetails(folder)"
            >
                <div class="folder-icon">{{ getFolderIcon(folder) }}</div>
                <div class="folder-title">{{ folder.title }}</div>
                <div v-if="getUnreadCount(folder) > 0" class="folder-badge">
                    {{ getUnreadCount(folder) }}
                </div>
            </div>
        </div>

        <DetailPopup
            :message="popupMessage"
            :is-visible="isPopupVisible"
            align="left"
            @close="closePopup"
        />
    </div>
</template>

<style scoped>
.folder-cards-container {
    width: 100%;
    max-width: 750px;
    margin: 10px auto;
    box-sizing: border-box;
}

.folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.folder-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px 10px;
    background: transparent;
    border: 1px solid #e0e0e0;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    min-height: 100px;
    user-select: none;
}

.folder-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
}

.folder-icon {
    font-size: 36px;
    margin-bottom: 8px;
    line-height: 1;
    filter: grayscale(1);
    opacity: 0.8;
}

.folder-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-heading);
    text-align: center;
    word-break: break-word;
    line-height: 1.3;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.folder-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 4px;
    min-width: 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
    .folder-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding: 12px;
    }

    .folder-card {
        min-height: 90px;
        padding: 12px 8px;
    }

    .folder-icon {
        font-size: 32px;
    }

    .folder-title {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .folder-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 10px;
    }

    .folder-card {
        min-height: 85px;
        padding: 10px 6px;
    }

    .folder-icon {
        font-size: 28px;
        margin-bottom: 6px;
    }

    .folder-title {
        font-size: 12px;
    }

    .folder-badge {
        font-size: 10px;
        padding: 2px 6px;
        top: 6px;
        right: 6px;
    }

    .folder-header h3 {
        font-size: 16px;
    }

    .folder-count {
        font-size: 12px;
        padding: 3px 8px;
    }
}
</style>
