import { computed } from 'vue';
import useDialogStore from '@/store/dialogs.js';

/**
 * Composable для аналитики диалогов
 * @returns {Object} Аналитические данные и методы
 */
export function useDialogAnalytics() {
    const dialogStore = useDialogStore();

    // Получаем все диалоги из store
    const dialogs = computed(() => dialogStore.state || []);

    // ✅ Правильное получение папок из foldersState
    const folders = computed(() => dialogStore.foldersState.rawFoldersData || []);

    // ✅ Получаем связи диалогов с папками
    const dialogsByFolder = computed(() => dialogStore.foldersState.dialogsIdByFolderId || {});

    /**
     * Сводные метрики
     */
    const metrics = computed(() => {
        const total = dialogs.value.length;
        const unread = dialogs.value.filter((d) => (d.unreadCount || 0) > 0).length;
        const mentions = dialogs.value.reduce((sum, d) => sum + (d.unreadMentionsCount || 0), 0);
        const archived = dialogs.value.filter((d) => d.isArchived).length;
        const pinned = dialogs.value.filter((d) => d.isPinned).length;
        const muted = dialogs.value.filter((d) => {
            return (
                d.notifySettings?.silent ||
                (d.notifySettings?.muteUntil && d.notifySettings.muteUntil > Date.now() / 1000)
            );
        }).length;
        const drafts = dialogs.value.filter((d) => d.draft?.text).length;

        // Права администрирования
        const admin = dialogs.value.filter((d) => d.entity?.isAdmin).length;
        const creator = dialogs.value.filter((d) => d.entity?.isCreator).length;

        // Premium и верификация
        const premium = dialogs.value.filter((d) => d.entity?.isPremium).length;
        const verified = dialogs.value.filter((d) => d.entity?.isVerified).length;

        // Онлайн (только для личных чатов)
        const online = dialogs.value.filter(
            (d) => d.type === 'user' && d.entity?.status?.type === 'online'
        ).length;

        return {
            total,
            unread,
            mentions,
            archived,
            pinned,
            muted,
            drafts,
            admin,
            creator,
            premium,
            verified,
            online,
        };
    });

    /**
     * Распределение по типам диалогов
     */
    const dialogTypes = computed(() => {
        const types = {
            user: 0,
            bot: 0,
            group: 0,
            supergroup: 0,
            channel: 0,
        };

        dialogs.value.forEach((dialog) => {
            const type = dialog.type;
            if (Object.prototype.hasOwnProperty.call(types, type)) {
                types[type]++;
            }
        });

        return {
            labels: ['Личные', 'Боты', 'Группы', 'Супергруппы', 'Каналы'],
            data: [types.user, types.bot, types.group, types.supergroup, types.channel],
            colors: ['#64adf5', '#ec6060', '#cc64f5', '#bfb32c', '#64f586'],
        };
    });

    /**
     * ТОП-10 диалогов по непрочитанным
     */
    const topUnread = computed(() => {
        // Фильтруем только диалоги с непрочитанными
        const withUnread = dialogs.value.filter((d) => (d.unreadCount || 0) > 0);

        // Сортируем по количеству непрочитанных (убывание)
        const sorted = withUnread.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));

        // Берём первые 10
        const top10 = sorted.slice(0, 10);

        return top10.map((dialog) => ({
            name: getDialogName(dialog),
            unreadCount: dialog.unreadCount || 0,
            unreadMentions: dialog.unreadMentionsCount || 0,
            unreadReactions: dialog.unreadReactionsCount || 0,
            type: dialog.type,
            id: dialog.id,
        }));
    });

    /**
     * Активность по датам (последние 30 дней)
     */
    const activityTimeline = computed(() => {
        const now = new Date();
        const daysAgo30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Создаём массив последних 30 дней
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            days.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                incoming: 0,
                outgoing: 0,
            });
        }

        // Подсчитываем сообщения по дням
        dialogs.value.forEach((dialog) => {
            if (!dialog.date) return;

            const msgDate = new Date(dialog.date);
            if (msgDate < daysAgo30) return;

            const dateStr = msgDate.toISOString().split('T')[0];
            const dayIndex = days.findIndex((d) => d.date === dateStr);

            if (dayIndex !== -1) {
                // Проверяем направление последнего сообщения
                if (dialog?.lastMessage?.out) {
                    days[dayIndex].outgoing++;
                } else {
                    days[dayIndex].incoming++;
                }
            }
        });

        return {
            labels: days.map((d) => {
                const date = new Date(d.date);
                return `${date.getDate()}.${date.getMonth() + 1}`;
            }),
            incoming: days.map((d) => d.incoming),
            outgoing: days.map((d) => d.outgoing),
        };
    });

    /**
     * Распределение диалогов по папкам
     */
    const folderDistribution = computed(() => {
        // Создаём карту: folderId -> статистика
        const folderMap = new Map();

        // Инициализируем существующие папки из rawFoldersData
        folders.value.forEach((folder) => {
            folderMap.set(folder.id, {
                id: folder.id,
                name: folder.title || 'Без названия',
                count: 0,
                unread: 0,
            });
        });

        // ✅ Добавляем "Главная" папку для диалогов без folderId
        folderMap.set(null, {
            id: null,
            name: 'Главная',
            count: 0,
            unread: 0,
        });

        // ✅ Добавляем "Архив" если есть архивные диалоги
        const hasArchived = dialogs.value.some((d) => d.isArchived);
        if (hasArchived) {
            folderMap.set('archive', {
                id: 'archive',
                name: 'Архив',
                count: 0,
                unread: 0,
            });
        }

        // ✅ Подсчитываем диалоги по папкам
        dialogs.value.forEach((dialog) => {
            const dialogId = String(dialog.id);

            // Архивные диалоги
            if (dialog.isArchived) {
                const archiveFolder = folderMap.get('archive');
                if (archiveFolder) {
                    archiveFolder.count++;
                    if ((dialog.unreadCount || 0) > 0) {
                        archiveFolder.unread++;
                    }
                }
                return; // Архивные не считаем в других папках
            }

            // Диалоги с явным folderId
            if (dialog.folderId !== null && dialog.folderId !== undefined) {
                const folderId = Number(dialog.folderId);

                if (!folderMap.has(folderId)) {
                    // Папка существует, но не загружена в rawFoldersData
                    folderMap.set(folderId, {
                        id: folderId,
                        name: `Папка #${folderId}`,
                        count: 0,
                        unread: 0,
                    });
                }

                const folder = folderMap.get(folderId);
                folder.count++;
                if ((dialog.unreadCount || 0) > 0) {
                    folder.unread++;
                }
                return;
            }

            // Проверяем через dialogsByFolder (связи из includedChatIds)
            let addedToFolder = false;
            for (const [folderId, dialogIds] of Object.entries(dialogsByFolder.value)) {
                if (dialogIds.includes(dialogId)) {
                    const folderIdNum = Number(folderId);

                    if (!folderMap.has(folderIdNum)) {
                        folderMap.set(folderIdNum, {
                            id: folderIdNum,
                            name: `Папка #${folderIdNum}`,
                            count: 0,
                            unread: 0,
                        });
                    }

                    const folder = folderMap.get(folderIdNum);
                    folder.count++;
                    if ((dialog.unreadCount || 0) > 0) {
                        folder.unread++;
                    }
                    addedToFolder = true;
                    break; // Диалог может быть только в одной папке
                }
            }

            // Если диалог не в папке - добавляем в "Главная"
            if (!addedToFolder) {
                const mainFolder = folderMap.get(null);
                mainFolder.count++;
                if ((dialog.unreadCount || 0) > 0) {
                    mainFolder.unread++;
                }
            }
        });

        // Фильтруем пустые папки и преобразуем в массив
        return Array.from(folderMap.values()).filter((folder) => folder.count > 0);
    });

    /**
     * Получить имя диалога
     */
    function getDialogName(dialog) {
        if (dialog.name) return dialog.name;

        if (dialog.entity?.title) return dialog.entity.title;

        if (dialog.entity?.firstName || dialog.entity?.lastName) {
            const firstName = dialog.entity.firstName || '';
            const lastName = dialog.entity.lastName || '';
            return `${firstName} ${lastName}`.trim();
        }

        if (dialog.entity?.username) return `@${dialog.entity.username}`;

        return 'Без имени';
    }

    /**
     * Получить текстовое описание для типов диалогов
     */
    const getDialogTypesDescription = () => {
        const types = dialogTypes.value;
        const total = types.data.reduce((sum, val) => sum + val, 0);

        if (total === 0) return 'Нет диалогов для анализа';

        const maxIndex = types.data.indexOf(Math.max(...types.data));
        const maxType = types.labels[maxIndex];
        const maxCount = types.data[maxIndex];
        const percentage = ((maxCount / total) * 100).toFixed(1);

        return `У вас ${total} диалогов. Больше всего ${maxType.toLowerCase()} - ${maxCount} (${percentage}%)`;
    };

    return {
        dialogs,
        folders,
        metrics,
        dialogTypes,
        topUnread,
        activityTimeline,
        folderDistribution,
        getDialogTypesDescription,
    };
}
