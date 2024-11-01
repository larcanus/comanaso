<script setup>
import FirstSection from '@/components/front-page-section/FirstSection.vue';
import SecondSection from '@/components/front-page-section/SecondSection.vue';
import ThirdSection from '@/components/front-page-section/ThirdSection.vue';
import FooterSection from '@/components/front-page-section/FooterSection.vue';
import FormLogin from '@/components/form/login/FormLogin.vue';
import { inject, ref } from 'vue';

const overflowXHiddenHandler = inject('overflowXHidden');
const openLoginForm = () => {
    state.value.isLoginFormShow = !state.value.isLoginFormShow;
    if (overflowXHiddenHandler) {
        overflowXHiddenHandler(state.value.isLoginFormShow);
    }
};

const props = defineProps({
    buttonLoginLoc: {
        type: String,
        default: 'Login',
    },
    isLoginFormShow: {
        type: Boolean,
        default: false,
    },
});

const state = ref({
    isLoginFormShow: false,
});
</script>

<template>
    <div class="page-container">
        <div class="content">
            <FirstSection />
            <SecondSection />
            <ThirdSection />
            <FooterSection />
        </div>
        <FormLogin v-if="state.isLoginFormShow" />
        <button class="floating-button" @click="openLoginForm">
            {{ props.buttonLoginLoc }}
        </button>
    </div>
</template>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #070707;
    min-height: 100vh;
    position: relative;
}

.content {
    width: 100%;
    font-family: Arial, sans-serif;
}

.floating-button {
    width: 10vw;
    position: fixed;
    top: 4%;
    right: 6%;
    padding: 10px 0 10px 0;
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
    border: none;
    border-radius: 1px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s;
    font-size: 15px;
    text-align: center;
}

.floating-button:hover {
    background-color: var(--vt-bt-background-color-hover);
}

@media (max-width: 700px) {
    .floating-button {
        width: 25vw;
    }
}
</style>
