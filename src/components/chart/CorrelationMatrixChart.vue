<script setup>
import { computed } from 'vue';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import { useResponsiveWidth } from '@/composables/useResponsiveWidth.js';
import ChartInfoButton from '@/components/common/ChartInfoButton.vue';
import { CHART_DESCRIPTIONS } from '@/constants/chartDescriptions.js';

const { correlationMatrix } = useDialogAnalytics();
const { width: containerWidth } = useResponsiveWidth();

const isMobile = computed(() => containerWidth.value <= 500);

const cellSize = computed(() => (isMobile.value ? 40 : 80));
const padding = computed(() => (isMobile.value ? 100 : 140));

const svgWidth = computed(() => {
    if (!correlationMatrix.value) return 0;
    return correlationMatrix.value.labels.length * cellSize.value + padding.value * 2;
});

const svgHeight = computed(() => {
    if (!correlationMatrix.value) return 0;
    return correlationMatrix.value.labels.length * cellSize.value + padding.value + 10;
});

// Функция для получения цвета на основе корреляции
const getColor = (value) => {
    // value от -1 до 1
    if (value > 0) {
        // Положительная корреляция: от белого к синему
        const intensity = Math.floor(value * 255);
        return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
    } else if (value < 0) {
        // Отрицательная корреляция: от белого к красному
        const intensity = Math.floor(Math.abs(value) * 255);
        return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
    } else {
        return '#ffffff';
    }
};

const matrixCells = computed(() => {
    if (!correlationMatrix.value) return [];

    const cells = [];
    const { labels, data } = correlationMatrix.value;

    data.forEach((row, i) => {
        row.forEach((value, j) => {
            cells.push({
                x: padding.value + j * cellSize.value,
                y: padding.value + i * cellSize.value,
                value: value.toFixed(2),
                color: getColor(value),
                rowLabel: labels[i],
                colLabel: labels[j],
            });
        });
    });

    return cells;
});

const strongestCorrelation = computed(() => {
    if (!correlationMatrix.value) return null;

    const { labels, data } = correlationMatrix.value;
    let maxValue = -2;
    let maxPair = null;

    data.forEach((row, i) => {
        row.forEach((value, j) => {
            if (i !== j && Math.abs(value) > Math.abs(maxValue)) {
                maxValue = value;
                maxPair = {
                    prop1: labels[i],
                    prop2: labels[j],
                    value: value.toFixed(2),
                };
            }
        });
    });

    return maxPair;
});

const chartInfo = CHART_DESCRIPTIONS.correlationMatrix;
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <div class="title-row">
                <h2 class="chart-title">Матрица корреляций</h2>
                <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
            </div>
            <div v-if="strongestCorrelation" class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Сильнейшая связь:</span>
                    <span class="stat-value">
                        {{ strongestCorrelation.prop1 }} ↔ {{ strongestCorrelation.prop2 }}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Коэффициент:</span>
                    <span class="stat-value">{{ strongestCorrelation.value }}</span>
                </div>
            </div>
        </div>

        <div v-if="correlationMatrix" class="matrix-container">
            <div class="svg-wrapper">
                <svg :width="svgWidth" :height="svgHeight" class="matrix-svg">
                    <!-- Ячейки матрицы -->
                    <g class="cells">
                        <g
                            v-for="(cell, index) in matrixCells"
                            :key="`cell-${index}`"
                            class="matrix-cell"
                        >
                            <rect
                                :x="cell.x"
                                :y="cell.y"
                                :width="cellSize"
                                :height="cellSize"
                                :fill="cell.color"
                                stroke="#2c3e50"
                                stroke-width="1"
                            >
                                <title>
                                    {{ cell.rowLabel }} × {{ cell.colLabel }}: {{ cell.value }}
                                </title>
                            </rect>
                            <text
                                :x="cell.x + cellSize / 2"
                                :y="cell.y + cellSize / 2"
                                text-anchor="middle"
                                dominant-baseline="middle"
                                class="cell-text"
                                :class="{
                                    'text-dark':
                                        parseFloat(cell.value) > 0.5 ||
                                        parseFloat(cell.value) < -0.5,
                                }"
                            >
                                {{ cell.value }}
                            </text>
                        </g>
                    </g>

                    <!-- Метки строк -->
                    <g class="row-labels">
                        <text
                            v-for="(label, index) in correlationMatrix.labels"
                            :key="`row-${index}`"
                            :x="padding - 10"
                            :y="padding + index * cellSize + cellSize / 2"
                            text-anchor="end"
                            dominant-baseline="middle"
                            class="label-text"
                        >
                            {{ label }}
                        </text>
                    </g>

                    <!-- Метки столбцов -->
                    <g class="col-labels">
                        <text
                            v-for="(label, index) in correlationMatrix.labels"
                            :key="`col-${index}`"
                            :x="padding + index * cellSize + cellSize / 2"
                            :y="padding - 40"
                            text-anchor="start"
                            dominant-baseline="middle"
                            class="label-text"
                            :transform="`rotate(-45, ${padding + index * cellSize + cellSize / 2}, ${padding - 40})`"
                        >
                            {{ label }}
                        </text>
                    </g>
                </svg>
            </div>

            <div class="legend">
                <h4>Шкала корреляции</h4>
                <div class="legend-gradient">
                    <div class="gradient-bar"></div>
                    <div class="gradient-labels">
                        <span>-1.0</span>
                        <span>0.0</span>
                        <span>+1.0</span>
                    </div>
                </div>
                <p class="legend-description">
                    Положительная корреляция (синий) — свойства связаны напрямую.<br />
                    Отрицательная корреляция (красный) — свойства связаны обратно.
                </p>
            </div>
        </div>

        <div v-else class="empty-state">
            <p>Недостаточно данных для матрицы корреляций</p>
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

.title-row {
    display: flex;
    justify-content: center;
    align-items: end;
    gap: 10px;
    margin-bottom: 20px;
}

.chart-title {
    font-size: 24px;
    color: #ffffff;
    margin: 0;
    text-align: center;
    line-height: 1.2;
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
    font-size: 16px;
    font-weight: 700;
    color: #3498db;
}

.matrix-container {
    width: 100%;
    border: 2px solid #364fa1;
    background: rgba(54, 79, 161, 0.2);
    padding: 20px;
}

.svg-wrapper {
    width: 100%;
    max-height: 600px;
    overflow: auto;
}

.matrix-svg {
    display: block;
    min-width: 100%;
}

.matrix-cell {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.matrix-cell:hover {
    opacity: 0.8;
}

.cell-text {
    fill: #2c3e50;
    font-size: 14px;
    font-weight: 600;
    pointer-events: none;
}

.cell-text.text-dark {
    fill: #ffffff;
}

.label-text {
    fill: #e3e2e2;
    font-size: 13px;
    font-weight: 500;
}

.legend {
    margin-top: 30px;
    text-align: center;
}

.legend h4 {
    color: #e3e2e2;
    font-size: 16px;
    margin: 0 0 15px 0;
}

.legend-gradient {
    max-width: 400px;
    margin: 0 auto 15px;
}

.gradient-bar {
    height: 30px;
    background: linear-gradient(
        to right,
        rgb(255, 0, 0) 0%,
        rgb(255, 128, 128) 25%,
        rgb(255, 255, 255) 50%,
        rgb(128, 128, 255) 75%,
        rgb(0, 0, 255) 100%
    );
    border-radius: 4px;
    border: 1px solid #2c3e50;
}

.gradient-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    color: #e3e2e2;
    font-size: 13px;
    font-weight: 600;
}

.legend-description {
    color: #95a5a6;
    font-size: 13px;
    line-height: 1.6;
    margin: 15px 0 0 0;
}

.empty-state {
    background: rgba(52, 152, 219, 0.1);
    border: 2px dashed rgba(52, 152, 219, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    color: #e3e2e2;
}

@media (max-width: 768px) {
    .chart-wrapper {
        padding: 20px;
    }

    .chart-title {
        font-size: 18px;
        line-height: 1.4;
    }

    .title-row {
        flex-wrap: wrap;
    }

    .stats-summary {
        gap: 15px;
    }

    .svg-wrapper {
        max-height: 450px;
    }

    .cell-text {
        font-size: 11px;
    }

    .label-text {
        font-size: 10px;
    }

    .legend h4 {
        font-size: 14px;
    }

    .legend-description {
        font-size: 12px;
    }
}
</style>
