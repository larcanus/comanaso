export function getStaticAnalyticsByDialogType(dialogTypeCounts) {
    if (!dialogTypeCounts) return 'Тут аналитика или что-то иное';

    return getScenarioByData(dialogTypeCounts);
}

function getScenarioByData(dialogTypeCounts) {
    const { channel, groupClose, groupOpen, user } = dialogTypeCounts;
    if (channel - groupOpen - groupClose - user > 50) {
        return scenario.channelMore;
    } else if (user - channel - groupOpen - groupClose > 50) {
        return scenario.userMore;
    } else if (groupOpen - channel - user - groupClose > 50) {
        return scenario.groupOpenMore;
    } else if (groupClose - channel - groupOpen - user > 50) {
        return scenario.groupCloseMore;
    }
}

const scenario = {
    channelMore:
        'Вы используете Telegram в основном для чтения каналов, что может указывать на интерес к получению новостей или другого контента. При этом вы не участвуете в групповых обсуждениях или личных переписках.',
    userMore:
        'Вы используете Telegram исключительно для личных переписок, что может говорить о предпочтении индивидуального общения и поддержания личных контактов. При этом вы не участвуете в группах или не читаете каналы.',
    groupCloseMore:
        'Вы активно используете закрытые группы, что может указывать на участие в специализированных или приватных обсуждениях. Однако вы не используете Telegram для чтения каналов или личных переписок.',
    groupOpenMore:
        'Вы активно участвуете в открытых группах, что может свидетельствовать о вашем интересе к публичным обсуждениям и обмену мнениями в широком кругу. Однако вы не используете Telegram для чтения каналов, закрытых групп или личных переписок.',
};
