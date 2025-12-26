<script setup>
import { computed, ref } from 'vue';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';

const { notificationFlow } = useDialogAnalytics();

// Используем composable для адаптивности
const { width: containerWidth } = useResponsiveWidth({
    mobileBreakpoint: 768,
    desktopWidthRatio: 0.85,
    mobileWidthRatio: 0.95,
});

// Адаптивные размеры на основе ширины контейнера
const svgWidth = computed(() => {
    const w = containerWidth.value;
    return w < 768 ? Math.min(w - 40, 600) : Math.min(w - 60, 800);
});

const svgHeight = computed(() => {
    return containerWidth.value < 768 ? 400 : 500;
});

const isMobile = computed(() => containerWidth.value < 768);

// Цвета для узлов
const nodeColors = {
    Личные: '#64adf5',
    Боты: '#ec6060',
    Группы: '#cc64f5',
    Супергруппы: '#bfb32c',
    Каналы: '#64f586',
    Включены: '#2ecc71',
    'Без звука': '#f39c12',
    Выключены: '#e74c3c',
    Прочитано: '#3498db',
    Непрочитано: '#e67e22',
};

const sankeyData = computed(() => {
    if (!notificationFlow.value || !notificationFlow.value.links || notificationFlow.value.links.length === 0) {
        return null;
    }

    const { nodes, links } = notificationFlow.value;

    // Адаптивные параметры
    const nodeWidth = isMobile.value ? 100 : 160;
    const nodeSpacing = isMobile.value ? 150 : 250;
    const fontSize = isMobile.value ? 11 : 14;
    const width = svgWidth.value;
    const height = svgHeight.value;

    // Позиционирование узлов
    const columns = [
        nodes.filter((n) => n.column === 0),
        nodes.filter((n) => n.column === 1),
        nodes.filter((n) => n.column === 2),
    ];

    const padding = isMobile.value ? 20 : 40;
    const usableHeight = height - padding * 2;

    const positionedNodes = [];
    columns.forEach((columnNodes, colIndex) => {
        const x = padding + colIndex * nodeSpacing;
        const totalValue = columnNodes.reduce((sum, n) => sum + n.value, 0);
        let currentY = padding;
        const nodeGap = isMobile.value ? 5 : 10;

        columnNodes.forEach((node) => {
            const nodeHeight = Math.max((node.value / totalValue) * usableHeight, 20);
            node.x = x;
            node.y = currentY;
            node.height = nodeHeight;
            node.width = nodeWidth;
            currentY += nodeHeight + nodeGap;
        });
    });

    // Создаём пути для связей
    const paths = links
        .map((link) => {
            const source = positionedNodes.find((n) => n.name === link.source);
            const target = positionedNodes.find((n) => n.name === link.target);

            if (!source || !target) return null;

            const x1 = source.x + 80;
            const y1 = source.y + source.height / 2;
            const x2 = target.x - 80;
            const y2 = target.y + target.height / 2;

            const midX = (x1 + x2) / 2;

            return {
                d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
                value: link.value,
                color: source.color,
                opacity: 0.3,
            };
        })
        .filter(Boolean);

    return { nodes: positionedNodes, paths, width, height };
});

const totalFlow = computed(() => {
    if (!notificationFlow.value) return 0;
    return notificationFlow.value.links.reduce((sum, link) => sum + link.value, 0);
});
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <h2 class="chart-title">Поток уведомлений</h2>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Всего потоков:</span>
                    <span class="stat-value">{{ totalFlow }}</span>
                </div>
            </div>
        </div>

        <div v-if="sankeyData" class="sankey-container">
            <svg
                v-if="sankeyData"
                :width="sankeyData.width"
                :height="sankeyData.height"
                class="sankey-svg"
                :viewBox="`0 0 ${sankeyData.width} ${sankeyData.height}`"
                preserveAspectRatio="xMidYMid meet"
            >
                <!-- Связи (пути) -->
                <g class="links">
                    <path
                        v-for="(path, index) in sankeyData.paths"
                        :key="`path-${index}`"
                        :d="path.d"
                        :stroke="path.color"
                        :stroke-opacity="path.opacity"
                        :stroke-width="Math.max(2, path.value * 2)"
                        fill="none"
                        class="sankey-path"
                    >
                        <title>{{ path.value }} диалогов</title>
                    </path>
                </g>

                <!-- Узлы -->
                <g class="nodes">
                    <g
                        v-for="(node, index) in sankeyData.nodes"
                        :key="`node-${index}`"
                        :transform="`translate(${node.x - (isMobile.value ? 50 : 80)}, ${node.y})`"
                        class="sankey-node"
                    >
                        <rect
                            :width="isMobile.value ? 100 : 160"
                            :height="node.height"
                            :fill="node.color"
                            rx="6"
                            class="node-rect"
                        />
                        <text
                            :x="isMobile.value ? 50 : 80"
                            :y="node.height / 2 - (isMobile.value ? 6 : 10)"
                            text-anchor="middle"
                            class="node-text"
                            :style="{ fontSize: isMobile.value ? '11px' : '14px' }"
                        >
                            {{ node.name }}
                        </text>
                        <text
                            :x="isMobile.value ? 50 : 80"
                            :y="node.height / 2 + (isMobile.value ? 8 : 10)"
                            text-anchor="middle"
                            class="node-text"
                            :style="{ fontSize: isMobile.value ? '10px' : '12px', fill: 'rgba(255, 255, 255, 0.8)' }"
                        >
                            {{ node.value }}
                        </text>
                    </g>
                </g>
            </svg>

            <div class="legend">
                <div class="legend-section">
                    <h4>Типы диалогов</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <span class="legend-color" style="background: #64adf5"></span>
                            <span>Личные</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #ec6060"></span>
                            <span>Боты</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #cc64f5"></span>
                            <span>Группы</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #bfb32c"></span>
                            <span>Супергруппы</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #64f586"></span>
                            <span>Каналы</span>
                        </div>
                    </div>
                </div>
                <div class="legend-section">
                    <h4>Уведомления</h4>
                    <div class="legend-items">
                        <div class="legend-item">
                            <span class="legend-color" style="background: #2ecc71"></span>
                            <span>Включены</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #f39c12"></span>
                            <span>Без звука</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #e74c3c"></span>
                            <span>Выключены</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="empty-state">
            <p>Недостаточно данных для диаграммы потоков</p>
        </div>
    </div>
</template>

<style scoped>
.chart-wrapper {
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chart-header {
    margin-bottom: 25px;
}

.chart-title {
    font-size: 24px;
    color: #ffffff;
    margin: 0 0 20px 0;
    text-align: center;
}

.stats-summary {
    display: flex;
    justify-content: center;
    gap: 30px;
    flex-wrap: wrap;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.stat-label {
    font-size: 12px;
    color: #95a5a6;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #3498db;
}

.sankey-container {
    width: 100%;
    max-width: 100%;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
    overflow: hidden;
    position: relative;
}

.sankey-svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    height: auto;
}

.sankey-path {
    transition: stroke-opacity 0.3s ease;
    cursor: pointer;
}

.sankey-path:hover {
    stroke-opacity: 0.7 !important;
}

.sankey-node {
    cursor: pointer;
    transition: opacity 0.3s ease;
}

.sankey-node:hover {
    opacity: 0.8;
}

.node-rect {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.node-text {
    fill: #ffffff;
    font-size: 14px;
    font-weight: 600;
    pointer-events: none;
}

.legend {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
}

.legend-section h4 {
    color: #e3e2e2;
    font-size: 14px;
    margin: 0 0 10px 0;
    text-align: center;
}

.legend-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e3e2e2;
    font-size: 13px;
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: inline-block;
}

.empty-state {
    background: rgba(52, 152, 219, 0.1);
    border: 2px dashed rgba(52, 152, 219, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    color: #95a5a6;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .legend {
        gap: 20px;
    }
}

@media (max-width: 768px) {
    .chart-wrapper {
        padding: 15px;
    }

    .chart-title {
        font-size: 18px;
        margin-bottom: 15px;
    }

    .stats-summary {
        gap: 15px;
    }

    .stat-label {
        font-size: 10px;
    }

    .stat-value {
        font-size: 14px;
    }

    .sankey-container {
        padding: 10px;
    }

    .legend {
        gap: 20px;
        margin-top: 20px;
    }

    .legend-section h4 {
        font-size: 12px;
    }

    .legend-item {
        font-size: 11px;
    }

    .legend-color {
        width: 12px;
        height: 12px;
    }
}

@media (max-width: 410px) {
    .stats-summary {
        flex-direction: column;
        gap: 10px;
    }

    .stat-item {
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }

    .legend {
        flex-direction: column;
        gap: 15px;
    }
}
</style>
