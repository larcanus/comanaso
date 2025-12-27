import { defineStore } from 'pinia';
import { shallowRef, toValue } from 'vue';

const useDialogStore = defineStore('dialog', () => {
    const state = shallowRef([]);
    const foldersState = shallowRef({
        rawFoldersData: [],
        dialogsIdByFolderId: {},
    });

    function setDialogs(data) {
        state.value = data;
        return state.value;
    }

    function setFolders(data) {
        // Если data - это массив, используем его напрямую
        // Если это объект с полем filters, используем filters
        const foldersArray = Array.isArray(data) ? data : data?.filters || [];

        // Фильтруем папки - исключаем дефолтные (isDefault: true)
        foldersState.value.rawFoldersData = foldersArray.filter((folder) => !folder.isDefault);

        // Очищаем предыдущие связи
        foldersState.value.dialogsIdByFolderId = {};

        // Обрабатываем каждую папку
        foldersState.value.rawFoldersData.forEach((folder) => {
            // includedChatIds - это уже массив строк с ID чатов
            if (folder.includedChatIds && Array.isArray(folder.includedChatIds)) {
                foldersState.value.dialogsIdByFolderId[folder.id] = folder.includedChatIds.map(
                    (id) => String(id)
                );
            } else {
                foldersState.value.dialogsIdByFolderId[folder.id] = [];
            }
        });

        console.log('Folders processed:', {
            rawFolders: foldersState.value.rawFoldersData,
            dialogsByFolder: foldersState.value.dialogsIdByFolderId,
        });

        return foldersState.value;
    }

    function getPreparedDialogs() {
        return validateDialogs(state.value, foldersState);
    }

    function $reset() {
        state.value = [];
    }

    return {
        state,
        foldersState,
        $reset,
        setDialogs,
        getPreparedDialogs,
        setFolders,
    };
});

/**
 * @param {Array<object>} dialogs
 * @param {object} foldersState
 * @return {Array<object>}
 */
function validateDialogs(dialogs = [], foldersState) {
    const preparedDialogs = dialogs?.map((dialog) => {
        const dialogData = toValue(dialog);
        const idValue = dialogData.id || dialogData.entity?.id || '';

        return {
            title: getTitleDialogLoc(dialogData),
            archived: getArchivedDialogLoc(dialogData.isArchived),
            type: getTypeDialogLoc(dialogData),
            id: { value: idValue, loc: String(idValue) },
            folderId: getFolderIdDialogLoc(dialogData, foldersState),
            pinned: getPinnedDialogLoc(dialogData.isPinned),
            unreadCount: {
                value: dialogData.unreadCount || 0,
                loc: dialogData.unreadCount || 0,
            },
            mute: getMuteDialogLoc(dialogData.notifySettings),
            date: getDateDialogLoc(dialogData.date),
            creator: getCreatorDialogLoc(dialogData.entity?.isCreator),
            unreadMark: {
                value: dialogData.unreadMark || false,
                loc: dialogData.unreadMark ? 'да' : 'нет',
            },
            draft: getDraftDialogLoc(dialogData.draft),
        };
    });
    console.log('preparedDialogs', preparedDialogs);
    return preparedDialogs;
}

function getTitleDialogLoc(dialogData) {
    const objectData = {
        value: '',
        loc: 'Без названия',
    };

    // Приоритет: name из корня диалога
    if (dialogData.name && dialogData.name.length > 0) {
        objectData.value = dialogData.name;
        objectData.loc = dialogData.name;
        return objectData;
    }

    // Затем проверяем title в entity (для групп и каналов)
    if (dialogData.entity?.title && dialogData.entity.title.length > 0) {
        objectData.value = dialogData.entity.title;
        objectData.loc = dialogData.entity.title;
        return objectData;
    }

    // Для пользователей составляем имя из firstName и lastName
    if (dialogData.entity?.firstName || dialogData.entity?.lastName) {
        const firstName = dialogData.entity.firstName || '';
        const lastName = dialogData.entity.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName.length > 0) {
            objectData.value = fullName;
            objectData.loc = fullName;
            return objectData;
        }
    }

    // Проверяем username как запасной вариант
    if (dialogData.entity?.username && dialogData.entity.username.length > 0) {
        objectData.value = `@${dialogData.entity.username}`;
        objectData.loc = `@${dialogData.entity.username}`;
        return objectData;
    }

    // Если всё отсутствует
    objectData.value = '';
    objectData.loc = 'Удаленный аккаунт';

    return objectData;
}

/**
 * @return {object}
 */
function getTypeDialogLoc(dialogData) {
    // Получаем тип из строкового поля type
    const typeValue = dialogData.type || '';

    const typeMap = {
        user: 'личный',
        group: 'групповой',
        supergroup: 'супергруппа',
        channel: 'канал',
        bot: 'бот',
    };

    // Уточняем тип для каналов и мегагрупп
    let finalType = typeValue;
    if (typeValue === 'channel' && dialogData.entity?.isBroadcast === false) {
        finalType = 'supergroup';
    }
    if (dialogData.entity?.isBot) {
        finalType = 'bot';
    }

    return {
        value: finalType,
        loc: typeMap[finalType] || finalType || 'неизвестно',
    };
}

function getFolderIdDialogLoc(dialogData, foldersState) {
    const objectData = {
        value: [],
        loc: '',
    };

    // Проверяем архивные диалоги
    if (dialogData.isArchived) {
        objectData.value.push(1);
        objectData.loc = 'Архив';
        return objectData;
    }

    // Проверяем folderId из нового API
    if (dialogData.folderId !== null && dialogData.folderId !== undefined) {
        const folderId = Number(dialogData.folderId);
        objectData.value.push(folderId);

        const folder = foldersState.value.rawFoldersData.find(
            (folderData) => folderData.id === folderId
        );

        objectData.loc = folder?.title || `Папка #${folderId}`;
        return objectData;
    }

    // Получаем ID диалога (приводим к строке для сравнения)
    const entityId = String(dialogData.id || '');

    if (!entityId) {
        objectData.loc = 'нет';
        return objectData;
    }

    // Ищем диалог в папках
    Object.keys(foldersState.value.dialogsIdByFolderId).forEach((folderId) => {
        const folderDialogIds = foldersState.value.dialogsIdByFolderId[folderId];

        // Проверяем наличие ID диалога в папке
        if (folderDialogIds.includes(entityId)) {
            objectData.value.push(Number(folderId));

            const folder = foldersState.value.rawFoldersData.find(
                (folderData) => folderData.id === Number(folderId)
            );

            const title = folder?.title || `Папка #${folderId}`;

            objectData.loc.length > 0
                ? (objectData.loc += `, '${title}'`)
                : (objectData.loc = `'${title}'`);
        }
    });

    if (objectData.loc.length === 0) {
        objectData.loc = 'нет';
    }

    return objectData;
}

function getArchivedDialogLoc(archived) {
    const objectData = {
        value: archived,
        loc: 'нет',
    };
    if (typeof archived === 'boolean') {
        objectData.loc = archived ? 'да' : 'нет';
    }

    return objectData;
}

function getPinnedDialogLoc(pinned) {
    const objectData = {
        value: pinned,
        loc: 'нет',
    };

    if (typeof pinned === 'boolean') {
        objectData.loc = pinned ? 'да' : 'нет';
    }

    return objectData;
}

function getMuteDialogLoc(notifySettings) {
    const objectData = {
        value: false,
        loc: 'нет',
    };

    if (!notifySettings) {
        return objectData;
    }

    // Проверяем silent флаг
    const isMuted = notifySettings.silent || false;
    objectData.value = isMuted;

    // Если есть muteUntil и это валидный timestamp
    if (notifySettings.muteUntil && notifySettings.muteUntil > 0) {
        const currentTimestamp = Math.floor(Date.now() / 1000); // текущее время в секундах
        const muteUntil = notifySettings.muteUntil;

        // Проверяем, не истекло ли время заглушения
        if (muteUntil > currentTimestamp) {
            objectData.value = true;
            // Конвертируем timestamp в дату
            const dateObj = getDateDialogLoc(muteUntil);
            objectData.loc = `до ${dateObj.loc}`;
            return objectData;
        }
    }

    // Если просто заглушен без конкретной даты
    objectData.loc = isMuted ? 'да' : 'нет';

    return objectData;
}

function getDateDialogLoc(timestamp) {
    const objectData = {
        value: timestamp,
        loc: '',
    };

    if (!timestamp) {
        return objectData;
    }

    // Обрабатываем разные форматы timestamp
    let date;
    if (typeof timestamp === 'string') {
        // ISO формат (2024-01-17T15:30:00Z)
        date = new Date(timestamp);
    } else {
        // Unix timestamp (может быть в секундах или миллисекундах)
        const preparedTimestamp =
            String(timestamp).length === 10 ? Number(`${timestamp}000`) : timestamp;
        date = new Date(preparedTimestamp);
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    objectData.loc = `${hours}:${minutes} ${day}-${month}-${year}`;

    return objectData;
}

function getCreatorDialogLoc(isCreator) {
    return {
        value: isCreator || false,
        loc: isCreator ? 'да' : 'нет',
    };
}

function getDraftDialogLoc(draft) {
    const objectData = {
        value: null,
        loc: 'нет',
    };

    if (draft && draft.message) {
        objectData.value = {
            text: draft.message,
            date: draft.date,
        };
        // Обрезаем текст черновика для отображения
        const shortText =
            draft.message.length > 30 ? draft.message.substring(0, 30) + '...' : draft.text;
        objectData.loc = `"${shortText}"`;
    }

    return objectData;
}

// Экспортируем как именованный экспорт и как default
export { useDialogStore };
export default useDialogStore;
