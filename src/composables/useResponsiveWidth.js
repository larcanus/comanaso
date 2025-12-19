import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable для динамического расчета ширины контента
 * с учетом адаптивности
 *
 * @param {Object} options - Опции расчета
 * @param {number} options.mobileBreakpoint - Точка перехода на мобильную версию (по умолчанию 750px)
 * @param {number} options.desktopWidthRatio - Коэффициент ширины для десктопа (по умолчанию 0.7 = 70%)
 * @param {number} options.mobileWidthRatio - Коэффициент ширины для мобильных (по умолчанию 0.9 = 90%)
 * @returns {Object} - Объект с reactive шириной
 */
export function useResponsiveWidth(options = {}) {
    const { mobileBreakpoint = 750, desktopWidthRatio = 0.7, mobileWidthRatio = 0.9 } = options;

    const width = ref(0);

    /**
     * Проверка, является ли текущая ширина мобильной
     */
    const isMobile = (currentWidth) => currentWidth <= mobileBreakpoint;

    /**
     * Расчет ширины контента на основе текущей ширины окна
     */
    const calculateWidth = () => {
        const windowWidth = window.innerWidth;
        const ratio = isMobile(windowWidth) ? mobileWidthRatio : desktopWidthRatio;
        return windowWidth * ratio;
    };

    /**
     * Обновление ширины при изменении размера окна
     */
    const updateWidth = () => {
        width.value = calculateWidth();
    };

    /**
     * Инициализация и подписка на события
     */
    onMounted(() => {
        width.value = calculateWidth();
        window.addEventListener('resize', updateWidth);
    });

    /**
     * Очистка подписок при размонтировании
     */
    onUnmounted(() => {
        window.removeEventListener('resize', updateWidth);
    });

    return {
        width,
    };
}
