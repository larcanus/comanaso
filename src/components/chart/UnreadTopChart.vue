<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { topUnread } = useDialogAnalytics();

const hasData = computed(() => topUnread.value.length > 0);

const chartData = computed(() => ({
    labels: topUnread.value.map((d) => d.name),
    datasets: [
        {
            label: 'Обычные',
            data: topUnread.value.map((d) => d.unreadCount - d.unreadMentions - d.unreadReactions),
            backgroundColor: '#64adf5',
        },
        {
            label: 'Упоминания',
            data: topUnread.value.map((d) => d.unreadMentions),
            backgroundColor: '#ff9800',
        },
        {
            label: 'Реакции',
            data: topUnread.value.map((d) => d.unreadReactions),
            backgroundColor: '#ec6060',
        },
    ],
}));

const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
            ticks: {
                color: '#e3e2e2',
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)',
            },
        },
        y: {
            stacked: true,
            ticks: {
                color: '#e3e2e2',
                font: {
                    size: 12,
                },
            },
            grid: {
                display: false,
            },
        },
    },
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: '#e3e2e2',
                padding: 15,
            },
        },
        tooltip: {
            callbacks: {
                footer: function (tooltipItems) {
                    const index = tooltipItems[0].dataIndex;
                    const dialog = topUnread.value[index];
                    return `Тип: ${getTypeLabel(dialog.type)}`;
                },
            },
        },
    },
};

function getTypeLabel(type) {
    const labels = {
        user: 'Личный',
        bot: 'Бот',
        group: 'Группа',
        supergroup: 'Супергруппа',
        channel: 'Канал',
    };
    return labels[type] || type;
}
</script>

<template>
    <div class="chart-container">
        <h2 class="section-title">ТОП-10 непрочитанных</h2>

        <div v-if="!hasData" class="empty-state">
            <p>Нет непрочитанных сообщений!</p>
            <p class="hint">Вы прочитали все диалоги</p>
        </div>

        <div v-else class="chart-wrapper">
            <div class="chart-canvas">
                <Bar :data="chartData" :options="chartOptions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin: 30px 0;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}

.chart-wrapper {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid #364fa1;
    border-radius: 3px;
    padding: 30px;
}

.chart-canvas {
    width: 100%;
    height: 500px;
}

.empty-state {
    background: rgba(76, 175, 80, 0.1);
    border: 2px dashed rgba(76, 175, 80, 0.3);
    border-radius: 12px;
    padding: 40px;
    text-align: center;
}

.empty-state p {
    color: #e3e2e2;
    font-size: 18px;
    margin: 10px 0;
}

.empty-state .hint {
    font-size: 14px;
    color: #999;
}

@media (max-width: 750px) {
    .chart-wrapper {
        padding: 20px;
    }

    .chart-canvas {
        height: 400px;
    }
}
</style>
