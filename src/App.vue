<script setup>
import { provide } from 'vue';

provide('overflowXHidden', (isHidden) => {
    // todo? this solution deprecated.
    if (isHidden) {
        document.documentElement.style.setProperty(
            '--wb-kit-scrollbar-thumb-background-color',
            'rgba(47, 46, 46, 0.7)'
        );
        document.documentElement.style.setProperty(
            '--wb-kit-scrollbar-track-background-color',
            'rgba(47, 46, 46, 0.7)'
        );
    } else {
        document.documentElement.style.setProperty(
            '--wb-kit-scrollbar-thumb-background-color',
            '#5e21f8'
        );
        document.documentElement.style.setProperty(
            '--wb-kit-scrollbar-track-background-color',
            '#050000'
        );
    }
});
</script>

<template>
    <header></header>

    <main>
        <RouterView />
    </main>
</template>

<style scoped></style>
