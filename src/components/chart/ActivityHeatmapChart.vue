<script setup>
import { computed } from 'vue';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import ChartInfoButton from '@/components/common/ChartInfoButton.vue';
import { CHART_DESCRIPTIONS } from '@/constants/chartDescriptions.js';

const { activityHeatmap } = useDialogAnalytics();

// Получаем максимальное значение для нормализации цвета
const maxValue = computed(() => {
    let max = 0;
    activityHeatmap.value.data.forEach((day) => {
        day.forEach((hour) => {
            if (hour > max) max = hour;
        });
    });
    return max || 1;
});

// Функция для получения цвета в зависимости от интенсивности
const getColor = (value) => {
    if (value === 0) return 'rgba(255, 255, 255, 0.05)';

    const intensity = value / maxValue.value;

    if (intensity < 0.2) return 'rgba(52, 152, 219, 0.3)';
    if (intensity < 0.4) return 'rgba(52, 152, 219, 0.5)';
    if (intensity < 0.6) return 'rgba(52, 152, 219, 0.7)';
    if (intensity < 0.8) return 'rgba(52, 152, 219, 0.85)';
    return 'rgba(52, 152, 219, 1)';
};

const daysLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const chartInfo = CHART_DESCRIPTIONS.activityHeatmap;
</script>

<template>
    <div class="chart-wrapper">
        <div class="chart-header">
            <h3 class="chart-title">Тепловая карта активности</h3>
            <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
        </div>
        <div class="chart-subtitle">
            <p>Активность по дням недели и часам суток (последние 30 дней)</p>
        </div>
        <div v-if="activityHeatmap.totalMessages > 0" class="heatmap-container">
            <!-- Заголовок с часами -->
            <div class="heatmap-grid">
                <div class="heatmap-corner"></div>
                <div v-for="hour in 24" :key="`hour-${hour}`" class="heatmap-hour-label">
                    {{ hour - 1 }}
                </div>

                <!-- Ряды для каждого дня недели -->
                <template v-for="(day, dayIndex) in activityHeatmap.data" :key="`day-${dayIndex}`">
                    <div class="heatmap-day-label">{{ daysLabels[dayIndex] }}</div>
                    <div
                        v-for="(value, hourIndex) in day"
                        :key="`cell-${dayIndex}-${hourIndex}`"
                        class="heatmap-cell"
                        :style="{ backgroundColor: getColor(value) }"
                        :title="`${daysLabels[dayIndex]}, ${hourIndex}:00 - ${value} сообщений`"
                    >
                        <span v-if="value > 0" class="cell-value">{{ value }}</span>
                    </div>
                </template>
            </div>

            <!-- Легенда -->
            <div class="heatmap-legend">
                <span class="legend-label">Меньше</span>
                <div class="legend-colors">
                    <div class="legend-color" style="background: rgba(255, 255, 255, 0.05)"></div>
                    <div class="legend-color" style="background: rgba(52, 152, 219, 0.3)"></div>
                    <div class="legend-color" style="background: rgba(52, 152, 219, 0.5)"></div>
                    <div class="legend-color" style="background: rgba(52, 152, 219, 0.7)"></div>
                    <div class="legend-color" style="background: rgba(52, 152, 219, 0.85)"></div>
                    <div class="legend-color" style="background: rgba(52, 152, 219, 1)"></div>
                </div>
                <span class="legend-label">Больше</span>
            </div>

            <!-- Статистика -->
            <div class="heatmap-stats">
                <div class="stat-item">
                    <span>Всего сообщений:</span>
                    <strong>{{ activityHeatmap.totalMessages }}</strong>
                </div>
                <div class="stat-item">
                    <span>Самый активный день:</span>
                    <strong>{{ daysLabels[activityHeatmap.peakDay] }}</strong>
                </div>
                <div class="stat-item">
                    <span>Самый активный час:</span>
                    <strong>{{ activityHeatmap.peakHour }}:00</strong>
                </div>
            </div>
        </div>

        <div v-else class="no-data">
            <p>Недостаточно данных для построения карты активности</p>
        </div>
    </div>
</template>

<style scoped>
.chart-wrapper {
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: center;
    align-items: end;
    margin-bottom: 20px;
    gap: 10px;
}

.chart-title {
    color: #e3e2e2;
    font-size: 24px;
    text-align: center;
    line-height: 1.2;
}

.chart-subtitle {
    color: #95a5a6;
    align-self: center;
    display: flex;
    justify-content: center;
}
.chart-subtitle p {
    color: #95a5a6;
    font-size: 14px;
    margin-bottom: 25px;
}

.heatmap-container {
    width: 100%;
    overflow-x: auto;
}

.heatmap-grid {
    display: grid;
    grid-template-columns: 40px repeat(24, 1fr);
    gap: 3px;
    min-width: 800px;
}

.heatmap-corner {
    grid-column: 1;
    grid-row: 1;
}

.heatmap-hour-label {
    text-align: center;
    color: #95a5a6;
    font-size: 11px;
    padding: 5px 2px;
    font-weight: 500;
}

.heatmap-day-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    color: #95a5a6;
    font-size: 12px;
    font-weight: 600;
}

.heatmap-cell {
    aspect-ratio: 1;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.heatmap-cell:hover {
    transform: scale(1.15);
    border-color: rgba(52, 152, 219, 0.5);
    z-index: 10;
}

.cell-value {
    font-size: 10px;
    color: #fff;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.heatmap-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 25px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 3px;
}

.legend-label {
    color: #95a5a6;
    font-size: 12px;
}

.legend-colors {
    display: flex;
    gap: 4px;
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.heatmap-stats {
    display: flex;
    gap: 30px;
    margin-top: 20px;
    padding: 15px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 3px;
    border-left: 3px solid #3498db;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #bdc3c7;
    font-size: 14px;
}

.stat-item strong {
    color: #3498db;
    font-size: 16px;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
}

.no-data i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.no-data p {
    font-size: 16px;
}

@media (max-width: 768px) {
    .chart-title {
        font-size: 18px;
        line-height: 1.4;
    }

    .chart-subtitle {
        font-size: 13px;
    }

    .heatmap-stats {
        flex-direction: column;
        gap: 10px;
    }
}
</style>
