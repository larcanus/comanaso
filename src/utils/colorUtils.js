/**
 * Генерирует случайный цвет на основе строки
 * @param {string} str - Строка для генерации цвета
 * @returns {string} HEX цвет
 */
export function getColorFromString(str) {
    const colors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
        '#F8B739',
        '#52B788',
        '#E76F51',
        '#2A9D8F',
    ];

    if (!str || str.length === 0) {
        return colors[0];
    }

    const index = str.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * Получает первую букву строки в верхнем регистре
 * @param {string} str - Строка
 * @returns {string} Первая буква в верхнем регистре
 */
export function getFirstLetter(str) {
    if (!str || str.length === 0) {
        return 'U';
    }
    return str.charAt(0).toUpperCase();
}
