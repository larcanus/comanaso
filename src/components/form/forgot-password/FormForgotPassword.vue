<script setup>
import { ref } from 'vue';
import { validateEmail } from '@/utils/validators.js';
import { authService } from '@/services/auth.service.js';
import { useRouter } from 'vue-router';

const router = useRouter();

const state = ref({
    emailValue: '',
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
});

async function onSubmit() {
    // Валидация email
    const emailValidation = validateEmail(state.value.emailValue);
    if (!emailValidation.isValid) {
        state.value.isError = true;
        state.value.errorMessage = emailValidation.error;
        return;
    }

    state.value.isLoading = true;
    state.value.isError = false;

    try {
        const result = await authService.requestPasswordReset(state.value.emailValue);

        if (result.ok) {
            state.value.isSuccess = true;
        }
    } catch (error) {
        console.error('onSubmit error', error);
        state.value.isError = true;
        state.value.errorMessage =
            error.userMessage || 'Не удалось отправить письмо. Попробуйте позже.';
    } finally {
        state.value.isLoading = false;
    }
}

function goBack() {
    router.push('/');
}
</script>

<template>
    <div class="background-container">
        <div class="form-container">
            <div v-if="!state.isSuccess" class="forgot-form">
                <h2>Восстановление пароля</h2>
                <p class="description">
                    Введите email, указанный при регистрации, для получения инструкции для сброса
                    пароля.
                </p>

                <div class="input-container">
                    <label for="emailInput">Email</label>
                    <input
                        id="emailInput"
                        v-model="state.emailValue"
                        type="email"
                        placeholder="example@mail.com"
                        :disabled="state.isLoading"
                        @keyup.enter="onSubmit"
                    />
                    <div class="tooltip" :class="{ invalid: state.isError }">
                        {{ state.errorMessage }}
                    </div>
                </div>

                <button
                    class="submit-btn"
                    :disabled="state.isLoading"
                    :class="{ disabled: state.isLoading }"
                    @click.prevent="onSubmit"
                >
                    {{ state.isLoading ? 'Отправка...' : 'Отправить инструкции' }}
                </button>

                <button class="back-btn" @click.prevent="goBack">
                    {{ '\u25c4 Вернуться к входу'.normalize() }}
                </button>
            </div>

            <div v-else class="success-message">
                <div class="success-icon">✓</div>
                <h2>Письмо отправлено</h2>
                <p>
                    Если аккаунт с таким email существует, на него придет письмо с инструкциями для
                    восстановления пароля.
                </p>
                <p class="hint">Проверьте папку "Спам", если письмо не пришло в течение 5 минут.</p>
                <button class="back-btn" @click.prevent="goBack">Вернуться к входу</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.background-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.form-container {
    background: white;
    padding: 40px;
    border-radius: 2px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    width: 85%;
}

.forgot-form h2 {
    margin-bottom: 12px;
    color: #333;
}

.description {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
    line-height: 1.5;
}

.input-container {
    margin-bottom: 20px;
}

.input-container label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
}

.input-container input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.input-container input:focus {
    outline: none;
    border-color: #667eea;
}

.input-container input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.tooltip {
    margin-top: 6px;
    font-size: 13px;
    color: transparent;
    min-height: 18px;
    transition: color 0.2s;
}

.tooltip.invalid {
    color: #e74c3c;
}

.submit-btn,
.back-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 2px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.submit-btn {
    background: #667eea;
    color: white;
    margin-bottom: 12px;
}

.submit-btn:hover:not(.disabled) {
    background: #5568d3;
}

.submit-btn.disabled {
    background: #ccc;
    cursor: not-allowed;
}

.back-btn {
    background: transparent;
    color: #666;
    border: 1px solid #ddd;
}

.back-btn:hover {
    background: #f5f5f5;
}

.success-message {
    text-align: center;
}

.success-icon {
    width: 60px;
    height: 60px;
    background: #27ae60;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 20px;
}

.success-message h2 {
    color: #333;
    margin-bottom: 16px;
}

.success-message p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 12px;
}

.hint {
    font-size: 13px;
    color: #999;
    margin-bottom: 24px !important;
}
</style>
