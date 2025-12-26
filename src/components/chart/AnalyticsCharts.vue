<script setup>
import MetricsCards from '@/components/card/MetricsCards.vue';
import DialogTypePieChart from '@/components/chart/DialogTypePie.vue';
import FoldersBarChart from '@/components/chart/FoldersBarChart.vue';
import TopUnreadChart from '@/components/chart/UnreadTopChart.vue';
import ActivityLineChart from '@/components/chart/ActivityLineChart.vue';
import CommunitiesBubbleChart from '@/components/chart/CommunitiesBubbleChart.vue';
import NotificationsGroupedChart from '@/components/chart/NotificationsGroupedChart.vue';
import GroupsAgeTimeline from '@/components/chart/GroupsAgeTimeline.vue';
import ActivityHeatmapChart from '@/components/chart/ActivityHeatmapChart.vue';
import FunnelChart from '@/components/chart/FunnelChart.vue';
import RadarChart from '@/components/chart/RadarChart.vue';
import SankeyChart from '@/components/chart/SankeyChart.vue';
import DraftsTimelineChart from '@/components/chart/DraftsTimelineChart.vue';
import CorrelationMatrixChart from '@/components/chart/CorrelationMatrixChart.vue';
</script>

<template>
    <div class="analytics-charts">
        <!-- Блок 1: Сводные метрики -->
        <section class="chart-section full-width">
            <MetricsCards />
        </section>

        <!-- Блок 2: Типы диалогов и папки -->
        <section class="chart-section">
            <DialogTypePieChart />
        </section>

        <section class="chart-section">
            <FoldersBarChart />
        </section>

        <!-- Блок 3: ТОП-10 непрочитанных -->
        <section class="chart-section full-width">
            <TopUnreadChart />
        </section>

        <!-- Блок 4: График активности -->
        <section class="chart-section full-width">
            <ActivityLineChart />
        </section>

        <!-- Блок 5: Тепловая карта активности -->
        <section class="chart-section full-width">
            <ActivityHeatmapChart />
        </section>

        <!-- Блок 6: Сообщества и уведомления -->
        <section class="chart-section">
            <CommunitiesBubbleChart />
        </section>

        <!-- Блок 7: уведомления -->
        <section class="chart-section">
            <NotificationsGroupedChart />
        </section>

        <!-- Блок 8: Временная шкала возраста сообществ -->
        <section class="chart-section full-width">
            <GroupsAgeTimeline />
        </section>

        <!-- 9. Воронка прочтения -->
        <section class="chart-section">
            <FunnelChart />
        </section>

        <!-- 10. Радарная диаграмма - профиль участия -->
        <section class="chart-section">
            <RadarChart />
        </section>

        <!-- 11. Диаграмма Санки - поток уведомлений -->
        <section class="chart-section">
            <SankeyChart />
        </section>

        <!-- 12. Таймлайн черновиков -->
        <section class="chart-section">
            <DraftsTimelineChart />
        </section>

        <!-- 13. Матрица корреляций -->
        <section class="chart-section">
            <CorrelationMatrixChart />
        </section>
    </div>
</template>

<style scoped>
.analytics-charts {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 30px;
}

.chart-section {
    background: rgba(44, 62, 80, 0.3);
    border-radius: 3px;
    padding: 30px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.chart-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(52, 152, 219, 0.3);
}

/* Ряд с двумя графиками */
.charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

/* Секция на всю ширину */
.full-width {
    grid-column: 1 / -1;
}

/* Адаптивность */
@media (max-width: 1200px) {
    .charts-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .analytics-charts {
        gap: 20px;
        margin-top: 20px;
    }

    .chart-section {
        padding: 20px;
    }

    .charts-row {
        gap: 20px;
    }
}
</style>
