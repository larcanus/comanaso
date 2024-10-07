<script setup>
const props = defineProps({
    pathIcon: String,
});
</script>

<template>
    <img :src="props.pathIcon" alt="Icon" />
</template>

<style scoped>
img {
    width: 64px;
    height: 64px;
    align-self: center;
}
</style>
