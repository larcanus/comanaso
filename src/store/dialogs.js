import { defineStore } from 'pinia';
import { shallowRef, toValue } from 'vue';

const useDialogStore = defineStore('dialog', () => {
    const state = shallowRef([]);
    const foldersState = shallowRef({
        rawFoldersData: [],
        dialogsIdByFolderId: {},
    });

    function setDialogs(data) {
        console.log('setDialogs', data);
        state.value = data;
        return state.value;
    }

    function setFolders(data) {
        console.log('setFolders', data);

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
        return {
            title: getTitleDialogLoc(dialogData),
            archived: getArchivedDialogLoc(dialogData.archived),
            type: getTypeDialogLoc(dialogData),
            id: { value: dialogData.id?.value, loc: dialogData.id?.value },
            folderId: getFolderIdDialogLoc(dialogData, foldersState),
            pinned: getPinnedDialogLoc(dialogData.pinned),
            unreadCount: {
                value: dialogData.unreadCount,
                loc: dialogData.unreadCount,
            },
            mute: getMuteDialogLoc(dialogData.dialog),
            date: getDateDialogLoc(dialogData.date),
            creator: getCreatorDialogLoc(dialogData.entity.creator),
        };
    });
    console.log('preparedDialogs', preparedDialogs);
    return preparedDialogs;
}

function getTitleDialogLoc(dialogData) {
    const objectData = {
        value: '',
        loc: 'Без названия'
    };

    if (dialogData.title && dialogData.title.length > 0) {
        objectData.value = dialogData.title;
        objectData.loc = dialogData.title;
        return objectData;
    }

    if (dialogData.name && dialogData.name.length > 0) {
        objectData.value = dialogData.name;
        objectData.loc = dialogData.name;
        return objectData;
    }

    // Если оба поля отсутствуют или пустые
    if ((!dialogData.title || dialogData.title.length === 0) &&
        (!dialogData.name || dialogData.name.length === 0)) {
        objectData.value = '';
        objectData.loc = 'Удаленный аккаунт';
    }

    return objectData;
}

/**
 * @return {object}
 */
function getTypeDialogLoc(dialogData) {
    const objectData = {
        value: {
            isChannel: dialogData.isChannel,
            isGroup: dialogData.isGroup,
            isUser: dialogData.isUser,
        },
    };

    if (dialogData.isChannel) {
        objectData.loc = 'канал';
    }

    if (dialogData.isGroup) {
        objectData.loc = 'групповой закрытый';
    }

    if (dialogData.isGroup && dialogData.isChannel && dialogData.entity.broadcast === false) {
        objectData.loc = 'групповой открытый';
    }

    if (dialogData.isUser) {
        objectData.loc = 'личный';
    }

    return objectData;
}

function getFolderIdDialogLoc(dialogData, foldersState) {
    const objectData = {
        value: [],
        loc: '',
    };

    // Проверяем архивные диалоги
    if (dialogData.folderId === 1) {
        objectData.value.push(1);
        objectData.loc = 'Архив';
        return objectData;
    }

    // Получаем ID диалога (приводим к строке для сравнения)
    const entityId = String(dialogData.entity?.id?.value || dialogData.id?.value || '');

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

function getMuteDialogLoc(dialog) {
    const objectData = {
        value: dialog?.notifySettings?.muteUntil || null,
        loc: 'нет',
    };

    if (dialog && dialog.notifySettings?.muteUntil > 1) {
        const currentTimestamp = Date.now();
        const until = currentTimestamp + dialog.notifySettings?.muteUntil;

        objectData.loc = getDateDialogLoc(until).loc;
    }

    return objectData;
}

function getDateDialogLoc(timestamp) {
    const objectData = {
        value: timestamp,
        loc: '',
    };
    const preparedTimestamp =
        String(timestamp).length === 10 ? Number(`${timestamp}000`) : timestamp;
    const date = new Date(preparedTimestamp);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    objectData.loc = `${hours}:${minutes} ${day}-${month}-${year}`;

    return objectData;
}

function getCreatorDialogLoc(creator) {
    return {
        value: creator,
        loc: creator ? 'да' : 'нет',
    };
}

// Экспортируем как именованный экспорт и как default
export { useDialogStore };
export default useDialogStore;
