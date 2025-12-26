<script setup>
import { computed } from 'vue';
import { useDialogAnalytics } from '@/composables/useDialogAnalytics.js';

const { metrics } = useDialogAnalytics();

const cards = computed(() => [
    {
        label: 'Всего диалогов',
        value: metrics.value.total,
        icon: '💬',
        color: '#64adf5',
    },
    {
        label: 'Непрочитанные',
        value: metrics.value.unread,
        icon: '📬',
        color: '#ec6060',
    },
    {
        label: 'Упоминания',
        value: metrics.value.mentions,
        icon: '📢',
        color: '#ff9800',
    },
    {
        label: 'Закреплённые',
        value: metrics.value.pinned,
        icon: '📌',
        color: '#3c9893',
    },
    {
        label: 'Заглушенные',
        value: metrics.value.muted,
        icon: '🔕',
        color: '#999',
    },
    {
        label: 'Черновики',
        value: metrics.value.drafts,
        icon: '✏️',
        color: '#cc64f5',
    },
    {
        label: 'Админ',
        value: metrics.value.admin,
        icon: '👑',
        color: '#ffd700',
    },
    {
        label: 'Создатель',
        value: metrics.value.creator,
        icon: '👤',
        color: '#0090ff',
    },
    {
        label: 'Онлайн сейчас',
        value: metrics.value.online,
        icon: '🟢',
        color: '#4caf50',
    },
]);
</script>

<template>
    <div class="metrics-container">
        <h2 class="section-title">Обзор сводных метрик</h2>
        <div class="metrics-grid">
            <div
                v-for="card in cards"
                :key="card.label"
                class="metric-card"
                :style="{ borderColor: card.color }"
            >
                <div class="metric-icon">{{ card.icon }}</div>
                <div class="metric-content">
                    <div class="metric-value" :style="{ color: card.color }">
                        {{ card.value }}
                    </div>
                    <div class="metric-label">{{ card.label }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.metrics-container {
    width: 100%;
    margin: 20px 0;
}

.section-title {
    color: #e3e2e2;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
}

.metric-card {
    background: rgba(54, 79, 161, 0.2);
    border: 2px solid;
    border-radius: 3px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
}

.metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.metric-icon {
    font-size: 32px;
}

.metric-content {
    flex: 1;
}

.metric-value {
    font-size: 28px;
    font-weight: bold;
    line-height: 1;
    margin-bottom: 4px;
}

.metric-label {
    font-size: 14px;
    color: #999;
}

@media (max-width: 750px) {
    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
    }

    .metric-card {
        padding: 16px;
        gap: 12px;
    }

    .metric-icon {
        font-size: 24px;
    }

    .metric-value {
        font-size: 24px;
    }

    .metric-label {
        font-size: 12px;
    }
}
</style>
