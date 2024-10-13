<script setup>
import imagePlusPath from '@/assets/plus.png';
</script>

<template>
    <div class="div-image">
        <img :src="imagePlusPath" alt="acc" />
    </div>
</template>

<style scoped>
.div-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

img {
    width: 30%;
    height: 30%;
    align-self: center;
    position: relative;
    z-index: 1;
    opacity: 0.4;
    transition: transform 0.3s;
}
@media (min-width: 1000px) {
    img:hover {
        transform: scale(1.05);
    }
}
img:active {
    transform: scale(1.2);
}
</style>
