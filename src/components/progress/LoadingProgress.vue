<script setup>
import { computed } from 'vue';

const props = defineProps({
    progress: {
        type: Number,
        required: true,
        validator: (value) => value >= 0 && value <= 100,
    },
    label: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'loading', // loading | success | error
        validator: (value) => ['loading', 'success', 'error'].includes(value),
    },
    step: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
    },
});

const statusIcon = computed(() => {
    switch (props.status) {
        case 'success':
            return '✓';
        case 'error':
            return '✗';
        default:
            return '';
    }
});

const statusClass = computed(() => {
    return `status-${props.status}`;
});

const stepText = computed(() => {
    if (props.step && props.total) {
        return `Шаг ${props.step} из ${props.total}`;
    }
    return '';
});
</script>

<template>
    <div class="loading-progress">
        <div class="progress-header">
            <div class="progress-info">
                <span v-if="stepText" class="step-text">{{ stepText }}</span>
                <span class="label" :class="statusClass">
                    {{ label }}
                    <span v-if="statusIcon" class="status-icon">{{ statusIcon }}</span>
                </span>
            </div>
            <span class="progress-percent">{{ progress }}%</span>
        </div>

        <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${progress}%` }" :class="statusClass">
                <div class="progress-bar-shine"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading-progress {
    width: 100%;
    max-width: 600px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    backdrop-filter: blur(10px);
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.progress-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.step-text {
    font-size: 12px;
    color: #999;
    font-weight: 500;
}

.label {
    font-size: 14px;
    color: #e3e2e2;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
}

.status-success .status-icon {
    background: #10b981;
    color: white;
}

.status-error .status-icon {
    background: #ef4444;
    color: white;
}

.progress-percent {
    font-size: 16px;
    font-weight: 600;
    color: #667eea;
}

.progress-bar-container {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
}

.progress-bar.status-success {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-bar.status-error {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.progress-bar-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shine 2s infinite;
}

@keyframes shine {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}
</style>
