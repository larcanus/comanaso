<script setup>
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';
import ChartInfoButton from '@/components/common/ChartInfoButton.vue';
import { CHART_DESCRIPTIONS } from '@/constants/chartDescriptions.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const { dialogs } = useDialogAnalytics();

// Активная вкладка
const activeTab = ref('hourly');

// Вкладки
const tabs = [
    { id: 'hourly', label: 'По часам' },
    { id: 'weekly', label: 'По дням недели' },
    { id: 'types', label: 'По типам диалогов' },
];

// 1. Распределение по часам суток
const hourlyData = computed(() => {
    const hours = Array(24).fill(0);

    dialogs.value.forEach((dialog) => {
        if (dialog.lastMessage?.date) {
            const hour = new Date(dialog.lastMessage.date).getHours();
            hours[hour]++;
        }
    });

    return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: 'Количество сообщений',
                data: hours,
                backgroundColor: hours.map((value) => {
                    const max = Math.max(...hours);
                    const intensity = value / max;
                    return `rgba(52, 152, 219, ${0.3 + intensity * 0.7})`;
                }),
                borderColor: '#3498db',
                borderWidth: 2,
            },
        ],
    };
});

// 2. Распределение по дням недели
const weeklyData = computed(() => {
    const days = Array(7).fill(0);
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    dialogs.value.forEach((dialog) => {
        if (dialog.lastMessage?.date) {
            const day = new Date(dialog.lastMessage.date).getDay();
            days[day]++;
        }
    });

    return {
        labels: dayNames,
        datasets: [
            {
                label: 'Активность',
                data: days,
                backgroundColor: [
                    'rgba(231, 76, 60, 0.6)', // Воскресенье
                    'rgba(52, 152, 219, 0.6)', // Понедельник
                    'rgba(46, 204, 113, 0.6)', // Вторник
                    'rgba(241, 196, 15, 0.6)', // Среда
                    'rgba(155, 89, 182, 0.6)', // Четверг
                    'rgba(52, 73, 94, 0.6)', // Пятница
                    'rgba(230, 126, 34, 0.6)', // Суббота
                ],
                borderColor: [
                    '#e74c3c',
                    '#3498db',
                    '#2ecc71',
                    '#f1c40f',
                    '#9b59b6',
                    '#34495e',
                    '#e67e22',
                ],
                borderWidth: 2,
            },
        ],
    };
});

// 3. Активность по типам диалогов и времени
const typesByTimeData = computed(() => {
    const hours = Array(24)
        .fill(0)
        .map(() => ({
            user: 0,
            bot: 0,
            group: 0,
            channel: 0,
        }));

    dialogs.value.forEach((dialog) => {
        if (dialog.lastMessage?.date) {
            const hour = new Date(dialog.lastMessage.date).getHours();
            const type = dialog.type === 'supergroup' ? 'group' : dialog.type;
            if (hours[hour][type] !== undefined) {
                hours[hour][type]++;
            }
        }
    });

    return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
            {
                label: 'Личные',
                data: hours.map((h) => h.user),
                backgroundColor: 'rgba(52, 152, 219, 0.6)',
                borderColor: '#3498db',
                borderWidth: 2,
            },
            {
                label: 'Боты',
                data: hours.map((h) => h.bot),
                backgroundColor: 'rgba(155, 89, 182, 0.6)',
                borderColor: '#9b59b6',
                borderWidth: 2,
            },
            {
                label: 'Группы',
                data: hours.map((h) => h.group),
                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                borderColor: '#2ecc71',
                borderWidth: 2,
            },
            {
                label: 'Каналы',
                data: hours.map((h) => h.channel),
                backgroundColor: 'rgba(241, 196, 15, 0.6)',
                borderColor: '#f1c40f',
                borderWidth: 2,
            },
        ],
    };
});

// Опции для графиков
const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
            labels: {
                color: '#e3e2e2',
            },
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    return `Сообщений: ${context.parsed.y}`;
                },
            },
        },
    },
    scales: {
        x: {
            ticks: { color: '#e3e2e2' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        y: {
            ticks: { color: '#e3e2e2' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            beginAtZero: true,
        },
    },
};

const stackedBarOptions = {
    ...barOptions,
    plugins: {
        ...barOptions.plugins,
        legend: {
            display: true,
            position: 'top',
            labels: {
                color: '#e3e2e2',
                padding: 15,
            },
        },
    },
    scales: {
        ...barOptions.scales,
        x: {
            ...barOptions.scales.x,
            stacked: true,
        },
        y: {
            ...barOptions.scales.y,
            stacked: true,
        },
    },
};

// Описание для текущей вкладки
const currentDescription = computed(() => {
    const descriptions = {
        hourly: 'График показывает распределение вашей активности по часам суток. Помогает определить пиковые часы общения.',
        weekly: 'Сравнение активности по дням недели. Видно, в какие дни вы наиболее активны в Telegram.',
        types: 'Распределение типов диалогов по времени суток. Показывает, когда вы общаетесь с ботами, в группах или личных чатах.',
    };
    return descriptions[activeTab.value];
});

const chartInfo = CHART_DESCRIPTIONS.timeAnalytics || {
    title: 'Временная аналитика',
    description:
        'Анализ вашей активности в Telegram по времени: часы суток, дни недели, типы диалогов.',
};
</script>

<template>
    <div class="chart-container">
        <div class="chart-header">
            <h2 class="section-title">Временная аналитика</h2>
            <ChartInfoButton :title="chartInfo.title" :description="chartInfo.description" />
        </div>

        <!-- Вкладки -->
        <div class="tabs">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="['tab', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- График -->
        <div class="chart-wrapper">
            <div class="chart-canvas">
                <Bar v-if="activeTab === 'hourly'" :data="hourlyData" :options="barOptions" />
                <Bar v-else-if="activeTab === 'weekly'" :data="weeklyData" :options="barOptions" />
                <Bar
                    v-else-if="activeTab === 'types'"
                    :data="typesByTimeData"
                    :options="stackedBarOptions"
                />
            </div>
        </div>

        <!-- Описание -->
        <div class="chart-description">
            <p>{{ currentDescription }}</p>
        </div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin: 30px 0;
}

.chart-header {
    display: flex;
    justify-content: center;
    align-items: end;
    margin-bottom: 20px;
    gap: 10px;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    margin: 0;
    line-height: 1.2;
}

.tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.tab {
    padding: 10px 20px;
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid rgba(54, 79, 161, 0.4);
    border-radius: 3px;
    color: #e3e2e2;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
}

.tab:hover {
    background: rgba(54, 79, 161, 0.3);
    border-color: #364fa1;
}

.tab.active {
    background: rgba(54, 79, 161, 0.5);
    border-color: #364fa1;
    box-shadow: 0 0 10px rgba(54, 79, 161, 0.3);
}

.chart-wrapper {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid #364fa1;
    border-radius: 3px;
    padding: 30px;
}

.chart-canvas {
    height: 400px;
}

.chart-description {
    margin-top: 20px;
    padding: 20px;
    background: rgba(54, 79, 161, 0.1);
    border-radius: 3px;
    text-align: center;
}

.chart-description p {
    color: #e3e2e2;
    margin: 0;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .chart-header {
        flex-direction: column;
        align-items: center;
    }

    .section-title {
        font-size: 20px;
    }

    .tabs {
        width: 100%;
    }

    .tab {
        flex: 1;
        min-width: 100px;
        font-size: 13px;
        padding: 8px 15px;
    }

    .chart-canvas {
        height: 300px;
    }

    .chart-wrapper {
        padding: 20px;
    }
}
</style>
