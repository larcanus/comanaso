<script setup>
import { computed } from 'vue';
import packageJson from '../../../package.json';

const versionApp = packageJson.version;
const authorWebsite = 'https://alexrulser.com/';

const openAuthorWebsite = () => {
    window.open(authorWebsite, '_blank', 'noopener,noreferrer');
};

const displayText = computed(() => {
    return `© 2025 | v${versionApp} | Author: `;
});
</script>

<template>
    <footer class="footer">
        <div class="footer-content">
            <p class="author-info">
                {{ displayText }}
                <button
                    class="author-link"
                    aria-label="Перейти на сайт автора"
                    @click="openAuthorWebsite"
                >
                    AlexRulSer
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

.author-link {
    background: none;
    border: none;
    color: #467e91;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    text-decoration: underline;
    transition: color 0.3s;
    font-family: inherit;
}

.author-link:hover {
    color: #ff4500;
}

.author-link:focus {
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
