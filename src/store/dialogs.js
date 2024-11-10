import { defineStore } from 'pinia';
import { shallowRef, toValue } from 'vue';

export const useDialogStore = defineStore('dialog', () => {
    const state = shallowRef([]);

    function setDialogs(data) {
        console.log('setDialogs', data);
        this.state = data;

        return this.state;
    }

    function $reset() {
        this.state = [];
    }

    function validateDialogs(dialogs = []) {
        const preparedDialogs = dialogs?.map((dialog) => {
            const dialogData = toValue(dialog);
            return {
                title: getTitleDialogLoc(dialogData),
                archived: getArchivedDialogLoc(dialogData.archived),
                type: getTypeDialogLoc(dialogData),
                id: { value: dialogData.id?.value, loc: dialogData.id?.value },
                folderId: getFolderIdDialogLoc(dialogData.folderId),
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

    return { state, $reset, setDialogs, validateDialogs };
});

function getTitleDialogLoc(dialogData) {
    const objectData = {};
    if (dialogData.title && dialogData.title.length > 0) {
        objectData.value = dialogData.title;
        objectData.loc = dialogData.title;
    }

    if (dialogData.name && dialogData.name.length > 0) {
        objectData.value = dialogData.name;
        objectData.loc = dialogData.name;
    }

    if (dialogData.title.length === 0 && dialogData.title.length === 0) {
        objectData.value = '';
        objectData.loc = 'Удаленный аккаунт';
    }

    return objectData;
}

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

function getFolderIdDialogLoc(folderId) {
    const objectData = {
        value: folderId,
        loc: 'нет',
    };
    if (folderId) {
        objectData.loc = folderId;
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
        value: dialog.notifySettings?.muteUntil,
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

function getCreatorDialogLoc(creator)
{
    return {
        value: creator,
        loc: creator ? 'да' : 'нет'
    };
}

export default useDialogStore;
