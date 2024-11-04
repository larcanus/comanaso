<script setup>
import DialogTable from '@/components/table/DialogTable.vue';
import UpdateButton from '@/components/button/UpdateButton.vue';
</script>

<template>
    <div class="view-container">
        <div class="header-container">
            <h1>Аналитика</h1>
            <p>Здесь отображаются доступные данные и аналитика.</p>
        </div>
        <DialogTable />
        <UpdateButton />
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
    margin: 25px;
}

p,
h1 {
    color: #e3e2e2;
}
</style>
