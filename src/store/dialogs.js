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
        this.state = {};
    }

    function validateDialogs(dialogs = []) {
        const preparedDialogs = dialogs?.map((dialog) => {
            const dialogData = toValue(dialog);
            return {
                title: dialogData.title,
                archived: getArchivedDialogLoc(dialogData.archived),
                type: getTypeDialogLoc(dialogData),
                id: dialogData.id?.value,
                folderId: getFolderIdDialogLoc(dialogData.folderId),
                pinned: getPinnedDialogLoc(dialogData.pinned),
                unreadCount: dialogData.unreadCount,
                mute: getMuteDialogLoc(dialogData.dialog),
                date: getDateDialogLoc(dialogData.date),
            };
        });
        console.log('preparedDialogs', preparedDialogs);
        return preparedDialogs;
    }

    return { state, $reset, setDialogs, validateDialogs };
});

function getTypeDialogLoc(dialogData) {
    if (dialogData.isChannel) {
        return 'канал';
    }

    if (dialogData.isGroup) {
        return 'групповой';
    }

    if (dialogData.isUser) {
        return 'юзер';
    }
}

function getFolderIdDialogLoc(folderId) {
    if (folderId) {
        return folderId;
    }

    return 'нет';
}

function getArchivedDialogLoc(archived) {
    if (typeof archived === 'boolean') {
        return archived ? 'да' : 'нет';
    }

    return 'нет';
}

function getPinnedDialogLoc(pinned) {
    if (typeof pinned === 'boolean') {
        return pinned ? 'да' : 'нет';
    }

    return 'нет';
}

function getMuteDialogLoc(dialog) {
    if (dialog && dialog.notifySettings?.muteUntil > 1) {
        const currentTimestamp = Date.now();
        const until = currentTimestamp + dialog.notifySettings?.muteUntil;

        return getDateDialogLoc(until);
    }

    return 'нет';
}

function getDateDialogLoc(timestamp) {
    const preparedTimestamp =
        String(timestamp).length === 10 ? Number(`${timestamp}000`) : timestamp;
    const date = new Date(preparedTimestamp);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

export default useDialogStore;
