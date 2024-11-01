<script setup>
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Настройки</h1>
            <p>Здесь отображаются настройки.</p>
        </div>
    </div>
</template>

<style scoped>
.view-container {
    min-height: 100vh;
    align-items: center;
    justify-content: flex-start;
    display: flex;
    flex-direction: column;
}

.header-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    margin: 20px;
}

.accounts-container {
    margin: 20px;
}

p,
h1 {
    color: #e3e2e2;
}
</style>
