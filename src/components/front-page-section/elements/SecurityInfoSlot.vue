<template>
    <div class="security-info-slot">
        <div class="info-icon">
            <slot name="icon"> </slot>
        </div>
        <div class="info-text-div">
            <p class="info-text">
                <slot name="info"> </slot>
            </p>
        </div>
    </div>
</template>

<style scoped>
.security-info-slot {
    display: flex;
    flex-direction: row;
    text-align: center;
    align-items: center;
    justify-content: center;
}

.info-icon {
    height: 64px;
    margin: 0;
    padding: 0;
    border: 1px #c8d4e0 solid;
    border-radius: 2px;
}

.info-text-div {
    padding: 0 10px 0 10px;
}

.info-text {
    font-size: 20px;
    color: #ffffff;
}

@media (max-width: 1100px) {
    .info-text {
        font-size: 15px;
    }
}

@media (max-width: 900px) {
    .info-text {
        font-size: 12px;
    }
}

@media (max-width: 700px) {
    .info-text {
        font-size: 10px;
    }
}

@media (max-width: 540px) {
    .info-text {
        font-size: 8px;
    }
}
</style>
