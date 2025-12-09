<script setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { Controller } from '@/components/form/login/controller.js';
import { useRouter } from 'vue-router';

const controller = new Controller();
const router = useRouter();

const props = defineProps({
    h2LoginLoc: {
        type: String,
        default: 'Sign In to your account',
    },
    h2RegLoc: {
        type: String,
        default: 'Registration new account',
    },
    signParagraph: {
        type: String,
        default: '\u25c4 Sign'.normalize(),
    },
    labelNameLoc: {
        type: String,
        default: 'Your name',
    },
    labelLoginLoc: {
        type: String,
        default: 'Login',
    },
    labelPswLoc: {
        type: String,
        default: 'Password',
    },
    placeholderLoginLoc: {
        type: String,
        default: '',
    },
    placeholderNameLoc: {
        type: String,
        default: '',
    },
    placeholderPasswordLoc: {
        type: String,
        default: '',
    },
    buttonLoginLoc: {
        type: String,
        default: 'Sign In',
    },
    buttonRegisterLoc: {
        type: String,
        default: 'Create account',
    },
    messageLoginError: {
        type: String,
        default: 'Error in login or password.\n Are you sure you entered the correct data?',
    },
    messageRegistrationError: {
        type: String,
        default: 'This login already exists',
    },
    messageRegistrationSuccess: {
        type: String,
        default: 'Successfully registered. You can now log in.',
    },
});

const state = ref({
    isRegister: false,
    nameValue: '',
    loginValue: '',
    passwordValue: '',
    isSuccessfulRegistration: false,
    isErrorValidInputName: false,
    isErrorValidInputLogin: false,
    isErrorValidInputPsw: false,
    isErrorLogin: false,
    isErrorRegistration: false,
    messageInputLoginValidError: '',
    messageInputPSWValidError: '',
    messageInputNameValidError: '',
    isAllDisabled: false,
    tooltipTimeout: null,
    tooltipBigTimeout: null,
    apiErrorMessage: '', // Для отображения ошибок API
});

const loginInputRef = useTemplateRef('inputLogin');

async function onClickOk() {
    if (checkValidInputs()) {
        state.value.isRegister ? await onClickCreateAccount() : await onClickSignIn();
    }

    hiddenTooltip();
}

async function onClickSignIn() {
    state.value.isAllDisabled = true;
    state.value.apiErrorMessage = '';

    const res = await controller.sendRestAuthentication({
        login: state.value.loginValue,
        password: state.value.passwordValue,
    });

    if (res.ok) {
        await router.push('/main');
    } else {
        // Используем сообщение об ошибке от API
        state.value.messageLoginError = res.error || props.messageLoginError;
        showLoginError();
    }

    state.value.isAllDisabled = false;
}

async function onClickCreateAccount() {
    state.value.isAllDisabled = true;
    state.value.apiErrorMessage = '';

    const res = await controller.sendRestRegistration({
        name: state.value.nameValue,
        login: state.value.loginValue,
        password: state.value.passwordValue,
    });

    if (res.ok) {
        showRegistrationSuccessful();
    } else {
        // Используем сообщение об ошибке от API
        state.value.messageRegistrationError = res.error || props.messageRegistrationError;
        showRegistrationError();
    }

    state.value.isAllDisabled = false;
}

function showLoginError() {
    state.value.isErrorLogin = true;

    clearTimeout(state.value.tooltipBigTimeout);
    state.value.tooltipBigTimeout = setTimeout(() => {
        state.value.isErrorLogin = false;
    }, 3000);
}

function showRegistrationError() {
    state.value.isErrorRegistration = true;

    clearTimeout(state.value.tooltipBigTimeout);
    state.value.tooltipBigTimeout = setTimeout(async () => {
        state.value.isErrorRegistration = false;
        await nextTick();
        loginInputRef.value?.focus();
    }, 3000);
}

function showRegistrationSuccessful() {
    state.value.isSuccessfulRegistration = true;

    clearTimeout(state.value.tooltipBigTimeout);
    state.value.tooltipBigTimeout = setTimeout(() => {
        state.value.isSuccessfulRegistration = false;
        state.value.isErrorLogin = false;
        state.value.isErrorRegistration = false;
        state.value.isRegister = false;
        // Очищаем поля после успешной регистрации
        state.value.nameValue = '';
        state.value.loginValue = '';
        state.value.passwordValue = '';
    }, 2000);
}

async function onClickTooltipBig() {
    clearTimeout(state.value.tooltipBigTimeout);
    state.value.isErrorLogin = false;
    state.value.isErrorRegistration = false;
    await nextTick();
    loginInputRef.value?.focus();
}

function checkValidInputs() {
    // Валидация логина
    if (!/^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(state.value.loginValue)) {
        state.value.messageInputLoginValidError = 'Login must include letters or numbers';
        state.value.isErrorValidInputLogin = true;
    } else if (state.value.loginValue.length < 3) {
        state.value.messageInputLoginValidError = 'Login should be at least 3 symbols';
        state.value.isErrorValidInputLogin = true;
    } else if (state.value.loginValue.length > 50) {
        state.value.messageInputLoginValidError = 'Login should be maximum 50 symbols';
        state.value.isErrorValidInputLogin = true;
    } else {
        state.value.messageInputLoginValidError = '';
        state.value.isErrorValidInputLogin = false;
    }

    // Валидация пароля (минимум 6 символов по новому API)
    if (!/^[a-zA-Z0-9]*$/.test(state.value.passwordValue)) {
        state.value.messageInputPSWValidError = 'Password must include only letters and numbers';
        state.value.isErrorValidInputPsw = true;
    } else if (state.value.passwordValue.length < 6) {
        state.value.messageInputPSWValidError = 'Password should be at least 6 symbols';
        state.value.isErrorValidInputPsw = true;
    } else {
        state.value.messageInputPSWValidError = '';
        state.value.isErrorValidInputPsw = false;
    }

    // Валидация имени (только для регистрации)
    if (state.value.isRegister) {
        if (!/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/.test(state.value.nameValue)) {
            state.value.messageInputNameValidError = 'Name must include letters, numbers or spaces';
            state.value.isErrorValidInputName = true;
        } else if (state.value.nameValue.length < 2) {
            state.value.messageInputNameValidError = 'Name should be at least 2 symbols';
            state.value.isErrorValidInputName = true;
        } else {
            state.value.messageInputNameValidError = '';
            state.value.isErrorValidInputName = false;
        }

        return !(
            state.value.isErrorValidInputLogin ||
            state.value.isErrorValidInputPsw ||
            state.value.isErrorValidInputName
        );
    }

    return !(state.value.isErrorValidInputLogin || state.value.isErrorValidInputPsw);
}

function hiddenTooltip() {
    clearTimeout(state.value.tooltipTimeout);
    if (
        state.value.isErrorValidInputLogin ||
        state.value.isErrorValidInputPsw ||
        state.value.isErrorValidInputName
    ) {
        state.value.tooltipTimeout = setTimeout(() => {
            state.value.isErrorValidInputLogin = false;
            state.value.isErrorValidInputPsw = false;
            state.value.isErrorValidInputName = false;
        }, 3000);
    }
}
</script>

<template>
    <div class="background-container">
        <div class="form-container">
            <form>
                <div class="header-container">
                    <p v-if="state.isRegister" class="sign" @click="state.isRegister = false">
                        {{ props.signParagraph }}
                    </p>
                    <h2>{{ state.isRegister ? h2RegLoc : h2LoginLoc }}</h2>
                </div>
                <div v-if="state.isRegister" class="input-container">
                    <label for="inputName">{{ props.labelNameLoc }}</label>
                    <input
                        id="inputName"
                        ref="inputName"
                        v-model="state.nameValue"
                        type="text"
                        :placeholder="props.placeholderNameLoc"
                        :disabled="state.isAllDisabled"
                        required
                    />
                    <div class="tooltip" :class="{ invalid: state.isErrorValidInputName }">
                        {{ state.messageInputNameValidError }}
                    </div>
                    <div
                        class="tooltip tooltipBig"
                        :class="{ invalid: state.isErrorRegistration }"
                        @click.prevent="onClickTooltipBig"
                    >
                        {{ state.messageRegistrationError }}
                    </div>
                </div>
                <div class="input-container">
                    <label for="inputLogin">{{ props.labelLoginLoc }}</label>
                    <input
                        id="inputLogin"
                        ref="inputLogin"
                        v-model="state.loginValue"
                        type="text"
                        :placeholder="props.placeholderLoginLoc"
                        :disabled="state.isAllDisabled"
                        required
                    />
                    <div class="tooltip" :class="{ invalid: state.isErrorValidInputLogin }">
                        {{ state.messageInputLoginValidError }}
                    </div>
                </div>
                <div class="input-container">
                    <label for="inputPsw">{{ props.labelPswLoc }}</label>
                    <input
                        id="inputPsw"
                        ref="inputPsw"
                        v-model="state.passwordValue"
                        type="password"
                        :placeholder="props.placeholderPasswordLoc"
                        :disabled="state.isAllDisabled"
                        autocomplete="on"
                        required
                    />
                    <div class="tooltip" :class="{ invalid: state.isErrorValidInputPsw }">
                        {{ state.messageInputPSWValidError }}
                    </div>
                    <div
                        class="tooltip tooltipBig"
                        :class="{ invalid: state.isErrorLogin }"
                        @click.prevent="onClickTooltipBig"
                    >
                        {{ state.messageLoginError }}
                    </div>
                    <div
                        class="tooltip tooltipBig"
                        :class="{ successful: state.isSuccessfulRegistration }"
                    >
                        {{ props.messageRegistrationSuccess }}
                    </div>
                </div>
                <button
                    class="ok-btn"
                    :disabled="state.isAllDisabled"
                    :class="{ disabled: state.isAllDisabled }"
                    @click.prevent="onClickOk"
                >
                    {{ state.isRegister ? buttonRegisterLoc : buttonLoginLoc }}
                </button>
                <button
                    v-if="!state.isRegister"
                    class="sub-btn"
                    :disabled="state.isAllDisabled"
                    :class="{ disabled: state.isAllDisabled }"
                    @click.prevent="state.isRegister = true"
                >
                    {{ props.buttonRegisterLoc }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.background-container {
    position: fixed;
    background-color: rgba(47, 46, 46, 0.7);
    width: 100vw;
    height: 100vh;
}

.form-container {
    position: fixed;
    top: 40%;
    left: calc(50% - 150px);
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    max-width: 300px;
    width: 100%;
}

.header-container {
    flex: max-content;
    justify-content: center;
    display: inline-flex;
    flex-direction: row;
    width: 100%;
}

@media (max-width: 450px) {
    .header-container {
        flex-direction: column;

        h2 {
            font-size: 17px;
        }

        .sign {
            margin: 7px 0 10px 0;
            color: #156bec;
            white-space: pre;
        }
    }
}

.form-container h2 {
    color: #4a4a4a;
    text-align: center;
    margin-bottom: 20px;
}

p {
    color: #535354;
}

.sign {
    margin: 7px 0 0 0;
    white-space: pre;
}

.sign:hover {
    color: #156bec;
    cursor: pointer;
}

.form-container input[type='text'],
.form-container input[type='password'] {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}

.form-container label {
    position: absolute;
    top: -3px;
    left: 10px;
    background: #fff;
    padding: 0 5px;
    font-size: 12px;
    color: #7c7b7b;
    border-radius: 5px;
}

.form-container button {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.ok-btn {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
}

.sub-btn {
    background-color: var(--vt-bt-background-color);
    color: var(--vt-bt-text-color);
}

.form-container button:hover {
    opacity: 0.9;
}

.input-container {
    position: relative;
    display: inline-block;
    width: 100%;
}

input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
}

.tooltip {
    visibility: hidden;
    opacity: 1;
    transition: opacity 1.7s ease-in-out;
    background-color: #ffdddd;
    color: #d8000c;
    text-align: center;
    justify-content: center;
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 8px;
    position: absolute;
    z-index: 1;
    bottom: 95%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-size: 14px;
}

.tooltipBig {
    transition: opacity 0.2s ease-in-out;
    background-color: #ffdddd;
    color: #d8000c;
    bottom: 5%;
    width: 100%;
    height: 200%;
    font-size: 15px;
}

.successful {
    background-color: #81d27f;
    color: #ffffff;
    visibility: visible;
    height: 300%;
}

.tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #ffdddd transparent transparent transparent;
}

.successful::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #75d072 transparent transparent transparent;
}

.invalid {
    visibility: visible;
}

.disabled {
    background-color: #4a4a4a;
}
</style>
