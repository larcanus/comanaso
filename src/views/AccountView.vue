<script setup>
function onClickConnect()
{
    console.log('onClickConnect');
}

</script>

<template>
    <div class="view-container">
        <h1>Аккаунты</h1>
        <p>Здесь отображается информация об аккаунтах.</p>

        <div class="button-container">
            <button @click="onClickConnect">
                подключить
            </button>
        </div>
    </div>
</template>

<style scoped>
.view-container {
    min-height: 100vh;
}
.button-container
{
    width: 100%;
    align-self: center;
    display: flex;
    justify-content: center;
    margin: 50px auto;
}
</style>
