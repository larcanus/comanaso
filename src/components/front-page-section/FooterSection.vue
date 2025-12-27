<script setup>
import { ref, computed } from 'vue';
import packageJson from '../../../package.json';

const showEmail = ref(false);
const versionApp = packageJson.version;

const toggleEmail = () => {
    showEmail.value = !showEmail.value;
};

const displayText = computed(() => {
    const baseText = `© 2025 | Author: AlexRulSer | v${versionApp}`;

    if (showEmail.value) {
        return `${baseText} | alex.rulser@gmail.com`;
    }

    return baseText;
});
</script>

<template>
    <footer class="footer">
        <div class="footer-content">
            <p class="author-info">
                {{ displayText }}
                <button
                    class="email-toggle"
                    :aria-label="showEmail ? 'Скрыть email' : 'Показать email'"
                    @click="toggleEmail"
                >
                    {{ showEmail ? ' [Скрыть]' : ' [Контакты]' }}
                </button>
            </p>
        </div>
    </footer>
</template>

<style scoped>
.footer {
    background-color: #1c1c1c;
    color: #9a9999;
    padding: 20px;
    text-align: center;
    width: 100%;
}

.footer-content {
    max-width: 800px;
    margin: 0 auto;
}

.author-info {
    margin: 0;
    font-size: 14px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 4px;
}

.email-toggle {
    background: none;
    border: none;
    color: #467e91;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    text-decoration: none;
    transition: color 0.3s;
    font-family: inherit;
}

.email-toggle:hover {
    color: #ff4500;
}

.email-toggle:focus {
    outline: 2px solid #467e91;
    outline-offset: 2px;
}

@media (max-width: 450px) {
    .author-info {
        flex-direction: column;
        gap: 8px;
    }
}
</style>
