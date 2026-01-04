<script setup>
import { nextTick, ref, useTemplateRef } from 'vue';
import { Controller } from '@/components/form/login/controller.js';
import { useRouter } from 'vue-router';
import { validateLogin, validatePassword, validateEmail } from '@/utils/validators.js';

const controller = new Controller();
const router = useRouter();

const props = defineProps({
    h2LoginLoc: {
        type: String,
        default: 'Войдите в свой аккаунт',
    },
    h2RegLoc: {
        type: String,
        default: 'Регистрация нового аккаунта',
    },
    signParagraph: {
        type: String,
        default: '\u25c4 Назад'.normalize(),
    },
    labelEmailLoc: {
        type: String,
        default: 'Email',
    },
    labelLoginLoc: {
        type: String,
        default: 'Логин',
    },
    labelPswLoc: {
        type: String,
        default: 'Пароль',
    },
    placeholderLoginLoc: {
        type: String,
        default: '',
    },
    placeholderEmailLoc: {
        type: String,
        default: '',
    },
    placeholderPasswordLoc: {
        type: String,
        default: '',
    },
    buttonLoginLoc: {
        type: String,
        default: 'Войти',
    },
    buttonRegisterLoc: {
        type: String,
        default: 'Создать аккаунт',
    },
    messageLoginError: {
        type: String,
        default: 'Ошибка в логине или пароле.\n Вы уверены, что ввели правильные данные?',
    },
    messageRegistrationError: {
        type: String,
        default: 'Этот логин уже существует',
    },
    messageRegistrationSuccess: {
        type: String,
        default: 'Регистрация успешна. Теперь вы можете войти.',
    },
});

const state = ref({
    isRegister: false,
    emailValue: '',
    loginValue: '',
    passwordValue: '',
    isSuccessfulRegistration: false,
    isErrorValidInputEmail: false,
    isErrorValidInputLogin: false,
    isErrorValidInputPsw: false,
    isErrorLogin: false,
    isErrorRegistration: false,
    messageInputLoginValidError: '',
    messageInputPSWValidError: '',
    messageInputEmailValidError: '',
    isAllDisabled: false,
    tooltipTimeout: null,
    tooltipBigTimeout: null,
    apiErrorMessage: '',
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
        state.value.messageLoginError = res.error || props.messageLoginError;
        showLoginError();
    }

    state.value.isAllDisabled = false;
}

async function onClickCreateAccount() {
    state.value.isAllDisabled = true;
    state.value.apiErrorMessage = '';

    const res = await controller.sendRestRegistration({
        email: state.value.emailValue,
        login: state.value.loginValue,
        password: state.value.passwordValue,
    });

    if (res.ok) {
        await showRegistrationSuccessful();
    } else {
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

async function showRegistrationSuccessful() {
    state.value.isSuccessfulRegistration = true;
    await router.push('/main');
    clearTimeout(state.value.tooltipBigTimeout);
    state.value.tooltipBigTimeout = setTimeout(() => {
        state.value.isSuccessfulRegistration = false;
        state.value.isErrorLogin = false;
        state.value.isErrorRegistration = false;
        state.value.isRegister = false;
        state.value.emailValue = '';
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
    let isValid = true;

    const loginValidation = validateLogin(state.value.loginValue);
    if (!loginValidation.isValid) {
        state.value.messageInputLoginValidError = loginValidation.error;
        state.value.isErrorValidInputLogin = true;
        isValid = false;
    } else {
        state.value.messageInputLoginValidError = '';
        state.value.isErrorValidInputLogin = false;
    }

    const passwordValidation = validatePassword(state.value.passwordValue);
    if (!passwordValidation.isValid) {
        state.value.messageInputPSWValidError = passwordValidation.error;
        state.value.isErrorValidInputPsw = true;
        isValid = false;
    } else {
        state.value.messageInputPSWValidError = '';
        state.value.isErrorValidInputPsw = false;
    }

    if (state.value.isRegister) {
        const emailValidation = validateEmail(state.value.emailValue);
        if (!emailValidation.isValid) {
            state.value.messageInputEmailValidError = emailValidation.error;
            state.value.isErrorValidInputEmail = true;
            isValid = false;
        } else {
            state.value.messageInputEmailValidError = '';
            state.value.isErrorValidInputEmail = false;
        }
    }

    return isValid;
}

function hiddenTooltip() {
    clearTimeout(state.value.tooltipTimeout);
    if (
        state.value.isErrorValidInputLogin ||
        state.value.isErrorValidInputPsw ||
        state.value.isErrorValidInputEmail
    ) {
        state.value.tooltipTimeout = setTimeout(() => {
            state.value.isErrorValidInputLogin = false;
            state.value.isErrorValidInputPsw = false;
            state.value.isErrorValidInputEmail = false;
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
                    <label for="inputEmail">{{ props.labelEmailLoc }}</label>
                    <input
                        id="inputEmail"
                        ref="inputEmail"
                        v-model="state.emailValue"
                        type="email"
                        :placeholder="props.placeholderEmailLoc"
                        :disabled="state.isAllDisabled"
                        required
                    />
                    <div class="tooltip" :class="{ invalid: state.isErrorValidInputEmail }">
                        {{ state.messageInputEmailValidError }}
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
                    <div v-if="!state.isRegister" class="forgot-password-link">
                        <router-link to="/forgot-password" class="forgot-link">
                            Забыли пароль?
                        </router-link>
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
.form-container input[type='password'],
.form-container input[type='email'] {
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

.forgot-password-link {
    margin-top: 8px;
    text-align: right;
}

.forgot-link {
    font-size: 13px;
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.forgot-link:hover {
    color: #333;
    text-decoration: underline;
}
</style>
