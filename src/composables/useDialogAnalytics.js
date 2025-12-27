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

    // Правильное получение папок из foldersState
    const folders = computed(() => dialogStore.foldersState.rawFoldersData || []);

    // Получаем связи диалогов с папками
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
        const drafts = dialogs.value.filter((d) => d.draft?.message).length;

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

        // Добавляем "Главная" папку для диалогов без folderId
        folderMap.set(null, {
            id: null,
            name: 'Главная',
            count: 0,
            unread: 0,
        });

        // Добавляем "Архив" если есть архивные диалоги
        const hasArchived = dialogs.value.some((d) => d.isArchived);
        if (hasArchived) {
            folderMap.set('archive', {
                id: 'archive',
                name: 'Архив',
                count: 0,
                unread: 0,
            });
        }

        // Подсчитываем диалоги по папкам
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

    // =====================================================
    // ВТОРОЙ ЭТАП: НОВЫЕ АНАЛИТИКИ
    // =====================================================

    /**
     * Данные для пузырьковой диаграммы: размер vs активность сообществ
     * X-ось: количество участников
     * Y-ось: дней с последнего сообщения
     * Размер пузырька: количество непрочитанных
     */
    const communitiesData = computed(() => {
        // Фильтруем группы, супергруппы и каналы
        const communities = dialogs.value.filter((d) =>
            ['group', 'supergroup', 'channel'].includes(d.type)
        );

        return communities
            .map((dialog) => {
                const participantsCount = dialog.entity?.participantsCount || 0;

                // Вычисляем дней с последнего сообщения
                let daysInactive = 0;
                if (dialog.date) {
                    const lastMessageDate = new Date(dialog.date);
                    const now = new Date();
                    daysInactive = Math.floor((now - lastMessageDate) / (1000 * 60 * 60 * 24));
                }

                const unreadCount = dialog.unreadCount || 0;

                return {
                    name: getDialogName(dialog),
                    x: participantsCount,
                    y: daysInactive,
                    r: Math.max(5, Math.min(30, unreadCount / 5)), // Размер от 5 до 30
                    unreadCount,
                    type: dialog.type,
                    id: dialog.id,
                };
            })
            .filter((item) => item.x > 0); // Только с известным количеством участников
    });

    /**
     * Данные для группированной диаграммы уведомлений
     * Группы: Личные, Группы, Каналы
     * Столбцы: Включены (со звуком), Без звука, Выключены (muted)
     */
    const notificationsData = computed(() => {
        const stats = {
            user: { enabled: 0, silent: 0, muted: 0 },
            group: { enabled: 0, silent: 0, muted: 0 },
            channel: { enabled: 0, silent: 0, muted: 0 },
        };

        dialogs.value.forEach((dialog) => {
            let category = dialog.type;

            // Объединяем supergroup в group
            if (category === 'supergroup') category = 'group';
            // Ботов считаем как личные
            if (category === 'bot') category = 'user';

            if (!stats[category]) return;

            // Используем isMuted из store (уже вычисленное значение)
            const isMuted = dialog.isMuted === true;

            if (isMuted) {
                // Заглушено до времени - выключены
                stats[category].muted++;
            } else {
                const notifySettings = dialog.notifySettings || {};
                const isSilent = notifySettings.silent === true;

                if (isSilent) {
                    // Уведомления есть, но без звука
                    stats[category].silent++;
                } else {
                    // Включены (дефолт или явно со звуком)
                    stats[category].enabled++;
                }
            }
        });

        const total =
            stats.user.enabled +
            stats.user.silent +
            stats.user.muted +
            stats.group.enabled +
            stats.group.silent +
            stats.group.muted +
            stats.channel.enabled +
            stats.channel.silent +
            stats.channel.muted;

        return {
            enabled: [stats.user.enabled, stats.group.enabled, stats.channel.enabled],
            silent: [stats.user.silent, stats.group.silent, stats.channel.silent],
            muted: [stats.user.muted, stats.group.muted, stats.channel.muted],
            total,
        };
    });

    /**
     * Данные для временной шкалы: возраст групп и каналов
     * Используем дату последнего сообщения (date) для анализа активности по годам
     */
    const groupsAgeTimeline = computed(() => {
        const communities = dialogs.value.filter(
            (d) => ['group', 'supergroup', 'channel'].includes(d.type) && d.date
        );

        if (communities.length === 0) {
            return {
                labels: [],
                groups: [],
                channels: [],
                supergroups: [],
                total: 0,
                totalGroups: 0,
                totalChannels: 0,
                totalSupergroups: 0,
            };
        }

        // Группируем по годам последней активности
        const yearMap = new Map();

        communities.forEach((dialog) => {
            const year = new Date(dialog.date).getFullYear();
            if (!yearMap.has(year)) {
                yearMap.set(year, { groups: 0, channels: 0, supergroups: 0 });
            }

            const stats = yearMap.get(year);
            if (dialog.type === 'channel') {
                stats.channels++;
            } else if (dialog.type === 'supergroup') {
                stats.supergroups++;
            } else {
                stats.groups++;
            }
        });

        // Преобразуем в массив и сортируем по годам
        const years = Array.from(yearMap.keys()).sort();
        const groupsData = years.map((year) => yearMap.get(year).groups);
        const channelsData = years.map((year) => yearMap.get(year).channels);
        const supergroupsData = years.map((year) => yearMap.get(year).supergroups);

        return {
            labels: years.map((y) => y.toString()),
            groups: groupsData,
            channels: channelsData,
            supergroups: supergroupsData,
            total: communities.length,
            totalGroups: groupsData.reduce((sum, val) => sum + val, 0),
            totalChannels: channelsData.reduce((sum, val) => sum + val, 0),
            totalSupergroups: supergroupsData.reduce((sum, val) => sum + val, 0),
        };
    });

    /**
     * Данные для круговой диаграммы: онлайн-статусы контактов
     */
    const contactsStatus = computed(() => {
        const users = dialogs.value.filter((d) => d.type === 'user' && !d.entity?.isBot);

        const statuses = {
            online: 0,
            recently: 0,
            lastWeek: 0,
            lastMonth: 0,
            offline: 0,
        };

        users.forEach((dialog) => {
            const statusType = dialog.entity?.status?.type;
            if (statusType && Object.prototype.hasOwnProperty.call(statuses, statusType)) {
                statuses[statusType]++;
            } else {
                statuses.offline++;
            }
        });

        return {
            labels: ['Онлайн', 'Недавно', 'На этой неделе', 'В этом месяце', 'Давно'],
            data: [
                statuses.online,
                statuses.recently,
                statuses.lastWeek,
                statuses.lastMonth,
                statuses.offline,
            ],
            colors: ['#64f586', '#64adf5', '#f5a742', '#cc64f5', '#95a5a6'],
        };
    });

    /**
     * Данные для тепловой карты: активность по часам и дням недели
     * Анализируем время последних сообщений
     */
    const activityHeatmap = computed(() => {
        // Инициализируем матрицу 7 дней x 24 часа
        const heatmapData = Array(7)
            .fill(0)
            .map(() => Array(24).fill(0));

        const daysLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        dialogs.value.forEach((dialog) => {
            if (!dialog.date) return;

            const msgDate = new Date(dialog.date);
            let dayOfWeek = msgDate.getDay(); // 0 = воскресенье
            // Преобразуем в формат Пн=0, Вс=6
            dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const hour = msgDate.getHours();

            heatmapData[dayOfWeek][hour]++;
        });

        // Вычисляем общее количество сообщений
        let totalMessages = 0;
        let peakValue = 0;
        let peakDay = 0;
        let peakHour = 0;

        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                const value = heatmapData[day][hour];
                totalMessages += value;

                if (value > peakValue) {
                    peakValue = value;
                    peakDay = day;
                    peakHour = hour;
                }
            }
        }

        return {
            daysLabels,
            hoursLabels,
            data: heatmapData,
            totalMessages,
            peakDay,
            peakHour,
            peakValue,
        };
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

    /**
     * Воронка прочтения (Chart 11)
     * Этапы: Всего диалогов → С непрочитанными → С упоминаниями → С реакциями
     * Каждый этап - подмножество предыдущего
     */
    const readingFunnel = computed(() => {
        const total = dialogs.value.length;
        const withUnread = dialogs.value.filter((d) => (d.unreadCount || 0) > 0).length;
        const withMentions = dialogs.value.filter((d) => (d.unreadMentionsCount || 0) > 0).length;
        const withReactions = dialogs.value.filter(
            (d) => (d.unreadReactionsCount || 0) > 0
        ).length;

        return {
            labels: ['Всего диалогов', 'Непрочитанные', 'Упоминания', 'Реакции'],
            data: [total, withUnread, withMentions, withReactions],
            // Процент от ВСЕХ диалогов
            percentagesFromTotal: [
                100,
                total > 0 ? ((withUnread / total) * 100).toFixed(1) : 0,
                total > 0 ? ((withMentions / total) * 100).toFixed(1) : 0,
                total > 0 ? ((withReactions / total) * 100).toFixed(1) : 0,
            ],
            // Процент от ПРЕДЫДУЩЕГО этапа (конверсия между этапами)
            conversionRates: [
                100, // Первый этап всегда 100%
                100, // От всех к непрочитанным (базовый уровень)
                withUnread > 0 ? ((withMentions / withUnread) * 100).toFixed(1) : 0,
                withMentions > 0 ? ((withReactions / withMentions) * 100).toFixed(1) : 0,
            ],
            // Общая конверсия (от начала до конца)
            totalConversion: total > 0 ? ((withReactions / total) * 100).toFixed(2) : 0,
        };
    });

    /**
     * Профиль участия - радарная диаграмма (Chart 12)
     * Метрики: Админ, Создатель, Закреплённые, Заглушённые, Архивные, С черновиками
     */
    const participationProfile = computed(() => {
        const total = dialogs.value.length;
        if (total === 0) {
            return {
                labels: [],
                data: [],
                percentages: [],
            };
        }

        const admin = dialogs.value.filter((d) => d.entity?.isAdmin).length;
        const creator = dialogs.value.filter((d) => d.entity?.isCreator).length;
        const pinned = dialogs.value.filter((d) => d.isPinned).length;
        const muted = dialogs.value.filter((d) => d.isMuted === true).length;
        const archived = dialogs.value.filter((d) => d.isArchived).length;
        const drafts = dialogs.value.filter((d) => d.draft?.message).length;

        return {
            labels: ['Админ', 'Создатель', 'Закреплено', 'Заглушено', 'Архив', 'Черновики'],
            data: [admin, creator, pinned, muted, archived, drafts],
            percentages: [
                ((admin / total) * 100).toFixed(1),
                ((creator / total) * 100).toFixed(1),
                ((pinned / total) * 100).toFixed(1),
                ((muted / total) * 100).toFixed(1),
                ((archived / total) * 100).toFixed(1),
                ((drafts / total) * 100).toFixed(1),
            ],
        };
    });

    /**
     * Поток уведомлений - диаграмма Санки (Chart 13)
     * Поток: Тип диалога → Статус уведомлений → Статус прочтения
     */
    const notificationFlow = computed(() => {
        const flows = [];

        // Типы диалогов
        const types = ['user', 'bot', 'group', 'supergroup', 'channel'];
        const typeLabels = {
            user: 'Личные',
            bot: 'Боты',
            group: 'Группы',
            supergroup: 'Супергруппы',
            channel: 'Каналы',
        };

        // Статусы уведомлений
        const notifyStates = ['enabled', 'silent', 'muted'];
        const notifyLabels = {
            enabled: 'Включены',
            silent: 'Без звука',
            muted: 'Выключены',
        };

        // Статусы прочтения
        const readStates = ['read', 'unread'];
        const readLabels = {
            read: 'Прочитано',
            unread: 'Непрочитано',
        };

        dialogs.value.forEach((dialog) => {
            let type = dialog.type;
            if (type === 'supergroup') type = 'supergroup'; // Оставляем отдельно
            if (type === 'bot') type = 'bot'; // Оставляем отдельно
            if (!types.includes(type)) return;

            // Определяем статус уведомлений
            let notifyState = 'enabled';
            if (dialog.isMuted === true) {
                notifyState = 'muted';
            } else if (dialog.notifySettings?.silent === true) {
                notifyState = 'silent';
            }

            // Определяем статус прочтения
            const readState = (dialog.unreadCount || 0) > 0 ? 'unread' : 'read';

            // Поток: Тип → Уведомления
            flows.push({
                source: typeLabels[type],
                target: notifyLabels[notifyState],
                value: 1,
            });

            // Поток: Уведомления → Прочтение
            flows.push({
                source: notifyLabels[notifyState],
                target: readLabels[readState],
                value: 1,
            });
        });

        // Агрегируем потоки
        const aggregated = {};
        flows.forEach((flow) => {
            const key = `${flow.source}→${flow.target}`;
            aggregated[key] = (aggregated[key] || 0) + flow.value;
        });

        const links = Object.entries(aggregated).map(([key, value]) => {
            const [source, target] = key.split('→');
            return { source, target, value };
        });

        // Собираем уникальные узлы с подсчетом значений и назначением колонок
        const nodeValues = {};
        const nodeColumns = {};

        // Определяем колонки для каждого типа узлов
        Object.values(typeLabels).forEach((label) => {
            nodeColumns[label] = 0; // Типы диалогов - колонка 0
        });
        Object.values(notifyLabels).forEach((label) => {
            nodeColumns[label] = 1; // Статусы уведомлений - колонка 1
        });
        Object.values(readLabels).forEach((label) => {
            nodeColumns[label] = 2; // Статусы прочтения - колонка 2
        });

        // Подсчитываем значения для каждого узла
        links.forEach((link) => {
            // Для source узлов считаем исходящие потоки
            nodeValues[link.source] = (nodeValues[link.source] || 0) + link.value;
        });

        // Для target узлов в последней колонке считаем входящие потоки
        links.forEach((link) => {
            if (nodeColumns[link.target] === 2) {
                nodeValues[link.target] = (nodeValues[link.target] || 0) + link.value;
            }
        });

        const nodes = Object.keys(nodeColumns).map((name) => ({
            name,
            value: nodeValues[name] || 0,
            column: nodeColumns[name],
        }));

        console.log('notificationFlow computed:', { nodes, links });

        return { nodes, links };
    });

    /**
     * Таймлайн черновиков (Chart 14)
     * Распределение черновиков по датам последнего изменения
     */
    const draftsTimeline = computed(() => {
        const dialogsWithDrafts = dialogs.value.filter((d) => d.draft?.message);

        if (dialogsWithDrafts.length === 0) {
            return {
                labels: [],
                data: [],
                total: 0,
                inRange: 0,
                oldest: null,
                newest: null,
                periodStart: null,
                periodEnd: null,
            };
        }

        // Группируем по датам (последние 30 дней)
        const now = new Date();
        const daysAgo30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            days.push({
                date: date.toISOString().split('T')[0],
                count: 0,
            });
        }

        let oldestDate = null;
        let newestDate = null;
        let inRangeCount = 0;

        dialogsWithDrafts.forEach((dialog) => {
            let draftDate = null;

            // Дата черновика в формате ISO строки
            if (dialog.draft?.date) {
                if (typeof dialog.draft.date === 'string') {
                    draftDate = new Date(dialog.draft.date);
                } else if (typeof dialog.draft.date === 'number') {
                    draftDate = new Date(dialog.draft.date * 1000);
                } else if (dialog.draft.date instanceof Date) {
                    draftDate = dialog.draft.date;
                }
            }

            // Fallback на дату последнего сообщения
            if (!draftDate || isNaN(draftDate.getTime())) {
                if (dialog.date) {
                    if (typeof dialog.date === 'string') {
                        draftDate = new Date(dialog.date);
                    } else if (typeof dialog.date === 'number') {
                        draftDate = new Date(dialog.date * 1000);
                    } else if (dialog.date instanceof Date) {
                        draftDate = dialog.date;
                    }
                }
            }

            // Если дата всё ещё невалидна, пропускаем
            if (!draftDate || isNaN(draftDate.getTime())) {
                return;
            }

            if (!oldestDate || draftDate < oldestDate) oldestDate = draftDate;
            if (!newestDate || draftDate > newestDate) newestDate = draftDate;

            // Проверяем, попадает ли дата в диапазон последних 30 дней
            if (draftDate < daysAgo30) {
                return;
            }

            inRangeCount++;

            const dateStr = draftDate.toISOString().split('T')[0];
            const dayIndex = days.findIndex((d) => d.date === dateStr);

            if (dayIndex !== -1) {
                days[dayIndex].count++;
            }
        });

        return {
            labels: days.map((d) => {
                const [year, month, day] = d.date.split('-');
                return `${day}.${month}`;
            }),
            data: days.map((d) => d.count),
            total: dialogsWithDrafts.length,
            inRange: inRangeCount,
            oldest: oldestDate,
            newest: newestDate,
            periodStart: daysAgo30,
            periodEnd: now,
        };
    });

    /**
     * Матрица корреляций (Chart 15)
     * Связи между свойствами диалогов: непрочитанные, закреплённые, заглушённые, архивные
     */
    const correlationMatrix = computed(() => {
        const properties = ['unread', 'pinned', 'muted', 'archived', 'draft'];
        const labels = ['Непрочитанные', 'Закреплённые', 'Заглушённые', 'Архивные', 'Черновики'];

        // Создаём бинарные векторы для каждого свойства
        const vectors = {
            unread: dialogs.value.map((d) => ((d.unreadCount || 0) > 0 ? 1 : 0)),
            pinned: dialogs.value.map((d) => (d.isPinned ? 1 : 0)),
            muted: dialogs.value.map((d) => (d.isMuted === true ? 1 : 0)),
            archived: dialogs.value.map((d) => (d.isArchived ? 1 : 0)),
            draft: dialogs.value.map((d) => (d.draft?.message ? 1 : 0)),
        };

        // Вычисляем корреляцию Пирсона между каждой парой
        const matrix = [];
        for (let i = 0; i < properties.length; i++) {
            const row = [];
            for (let j = 0; j < properties.length; j++) {
                if (i === j) {
                    row.push(1); // Диагональ = 1
                } else {
                    const correlation = calculateCorrelation(
                        vectors[properties[i]],
                        vectors[properties[j]]
                    );
                    row.push(correlation);
                }
            }
            matrix.push(row);
        }

        return {
            labels,
            data: matrix,
        };
    });

    /**
     * Вычисление коэффициента корреляции Пирсона
     */
    function calculateCorrelation(x, y) {
        const n = x.length;
        if (n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return 0;

        return numerator / denominator;
    }

    return {
        dialogs,
        folders,
        metrics,
        dialogTypes,
        topUnread,
        activityTimeline,
        folderDistribution,
        getDialogTypesDescription,
        communitiesData,
        notificationsData,
        groupsAgeTimeline,
        contactsStatus,
        activityHeatmap,

        readingFunnel,
        participationProfile,
        notificationFlow,
        draftsTimeline,
        correlationMatrix,
    };
}
