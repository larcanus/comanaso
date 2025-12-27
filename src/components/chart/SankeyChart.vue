<script setup>
import { computed } from 'vue';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';

const { notificationFlow } = useDialogAnalytics();
const { width: containerWidth } = useResponsiveWidth({
    mobileBreakpoint: 768,
    desktopWidthRatio: 0.85,
    mobileWidthRatio: 0.95,
});

const isMobile = computed(() => containerWidth.value <= 768);

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
    if (!notificationFlow.value) return null;

    const { nodes, links } = notificationFlow.value;
    if (!nodes || !links || nodes.length === 0 || links.length === 0) return null;

    // Параметры для расчёта
    const nodeWidth = isMobile.value ? 100 : 140;
    const nodeSpacing = isMobile.value ? 180 : 250;
    const width = isMobile.value ? 600 : 800;
    const padding = 40;
    const nodeGap = isMobile.value ? 15 : 25;
    const minNodeHeight = isMobile.value ? 50 : 60;

    // Добавляем цвета к узлам
    const processedNodes = nodes.map((node) => ({
        ...node,
        color: nodeColors[node.name] || '#95a5a6',
        value: node.value || 0,
        column: node.column !== undefined ? node.column : 0,
    }));

    // Группируем узлы по колонкам
    const columns = [[], [], []];
    processedNodes.forEach((node) => {
        const col = Math.max(0, Math.min(2, node.column));
        columns[col].push(node);
    });

    // Рассчитываем необходимую высоту для каждой колонки по значению
    const columnHeightsByValue = columns.map((columnNodes) => {
        if (columnNodes.length === 0) return 0;
        const totalValue = columnNodes.reduce((sum, n) => sum + (n.value || 0), 0);
        const avgNodeHeight = totalValue > 0 ? Math.max(minNodeHeight, 80) : minNodeHeight;
        return columnNodes.length * avgNodeHeight + (columnNodes.length - 1) * nodeGap;
    });

    // Позиционирование узлов
    const columnX = [padding, padding + nodeSpacing, padding + nodeSpacing * 2];

    columns.forEach((columnNodes, colIndex) => {
        if (columnNodes.length === 0) return;

        const totalValue = columnNodes.reduce((sum, n) => sum + (n.value || 0), 0);
        let currentY = padding;

        columnNodes.forEach((node) => {
            // Рассчитываем высоту узла пропорционально его значению
            const nodeHeight =
                totalValue > 0
                    ? Math.max(
                          (node.value / totalValue) * columnHeightsByValue[colIndex],
                          minNodeHeight
                      )
                    : minNodeHeight;

            node.x = columnX[colIndex] || padding;
            node.y = currentY;
            node.height = nodeHeight;
            node.width = nodeWidth;
            currentY += nodeHeight + nodeGap;
        });
    });

    // Рассчитываем необходимую высоту для каждой колонки по значению
    const columnHeights = columns.map((columnNodes) => {
        if (columnNodes.length === 0) return 0;
        const totalValue = columnNodes.reduce((sum, n) => sum + nodeGap + (n.height || 0), 0);

        return Math.round(totalValue, 10);
    });

    // Берём максимальную высоту колонки + отступы
    const maxColumnHeight = Math.max(...columnHeights);
    const height = maxColumnHeight + padding * 2;

    // Создаём пути для связей
    const paths = links
        .map((link) => {
            const source = processedNodes.find((n) => n.name === link.source);
            const target = processedNodes.find((n) => n.name === link.target);

            if (!source || !target || !source.x || !target.x) return null;

            const x1 = source.x + source.width;
            const y1 = source.y + source.height / 2;
            const x2 = target.x;
            const y2 = target.y + target.height / 2;
            const midX = (x1 + x2) / 2;

            return {
                d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
                value: link.value || 0,
                color: source.color,
                opacity: 0.3,
            };
        })
        .filter(Boolean);

    return { nodes: processedNodes, paths, width, height };
});

const totalFlow = computed(() => {
    if (!notificationFlow.value || !notificationFlow.value.links) return 0;
    return notificationFlow.value.links.reduce((sum, link) => sum + (link.value || 0), 0);
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
            <div class="svg-wrapper">
                <svg
                    :width="sankeyData.width"
                    :height="sankeyData.height"
                    class="sankey-svg"
                    :viewBox="`0 0 ${sankeyData.width} ${sankeyData.height}`"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <!-- Связи -->
                    <g class="links">
                        <path
                            v-for="(path, index) in sankeyData.paths"
                            :key="`path-${index}`"
                            :d="path.d"
                            :stroke="path.color"
                            :stroke-opacity="path.opacity"
                            :stroke-width="Math.max(2, path.value * 0.5)"
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
                            :transform="`translate(${node.x}, ${node.y})`"
                            class="sankey-node"
                        >
                            <rect
                                :width="node.width"
                                :height="node.height"
                                :fill="node.color"
                                rx="6"
                                class="node-rect"
                            />
                            <text
                                :x="node.width / 2"
                                :y="node.height / 2 - 8"
                                text-anchor="middle"
                                class="node-text node-name"
                            >
                                {{ node.name }}
                            </text>
                            <text
                                :x="node.width / 2"
                                :y="node.height / 2 + 10"
                                text-anchor="middle"
                                class="node-text node-value"
                            >
                                {{ node.value }}
                            </text>
                        </g>
                    </g>
                </svg>
            </div>

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
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
}

.svg-wrapper {
    width: 100%;
    overflow: auto;
    max-height: 700px;
}

.sankey-svg {
    display: block;
    min-width: 100%;
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
    font-weight: 600;
    pointer-events: none;
}

.node-name {
    font-size: 14px;
}

.node-value {
    font-size: 12px;
    fill: rgba(255, 255, 255, 0.8);
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
}

.empty-state {
    background: rgba(52, 152, 219, 0.1);
    border: 2px dashed rgba(52, 152, 219, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    color: #95a5a6;
}

@media (max-width: 768px) {
    .chart-wrapper {
        padding: 15px;
    }

    .chart-title {
        font-size: 18px;
    }

    .stat-label {
        font-size: 10px;
    }

    .stat-value {
        font-size: 18px;
    }

    .sankey-container {
        padding: 10px;
    }

    .svg-wrapper {
        max-height: 500px;
    }

    .node-name {
        font-size: 11px;
    }

    .node-value {
        font-size: 10px;
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
        width: 16px;
        height: 16px;
    }
}
</style>
