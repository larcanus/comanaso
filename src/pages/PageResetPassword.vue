<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authService } from '@/services/auth.service.js';
import { validatePassword } from '@/utils/validators.js';

const route = useRoute();
const router = useRouter();

const state = ref({
    token: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    isValidatingToken: true,
    isTokenValid: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
    passwordRequirements: {
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
    },
});

// Проверка требований к паролю в реальном времени
function checkPasswordRequirements(password) {
    state.value.passwordRequirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
    };
}

// Валидация токена при монтировании
onMounted(async () => {
    const token = route.query.token;

    if (!token) {
        state.value.isValidatingToken = false;
        state.value.isError = true;
        state.value.errorMessage = 'Токен не найден в URL';
        return;
    }

    state.value.token = token;

    try {
        const result = await authService.validateResetToken(token);

        if (result.ok && result.data.valid) {
            state.value.isTokenValid = true;
            state.value.email = result.data.email;
        } else {
            state.value.isError = true;
            state.value.errorMessage = 'Ссылка недействительна или истекла';
        }
    } catch (error) {
        console.error('Token validation error:', error);
        state.value.isError = true;
        state.value.errorMessage =
            error.userMessage || 'Не удалось проверить токен. Попробуйте запросить новую ссылку.';
    } finally {
        state.value.isValidatingToken = false;
    }
});

// Обработка изменения пароля
function onPasswordInput() {
    checkPasswordRequirements(state.value.newPassword);
    state.value.isError = false;
}

// Отправка формы
async function onSubmit() {
    // Валидация нового пароля
    const passwordValidation = validatePassword(state.value.newPassword);
    if (!passwordValidation.isValid) {
        state.value.isError = true;
        state.value.errorMessage = passwordValidation.error;
        return;
    }

    // Проверка совпадения паролей
    if (state.value.newPassword !== state.value.confirmPassword) {
        state.value.isError = true;
        state.value.errorMessage = 'Пароли не совпадают';
        return;
    }

    state.value.isLoading = true;
    state.value.isError = false;

    try {
        const result = await authService.resetPassword(state.value.token, state.value.newPassword);

        if (result.ok) {
            state.value.isSuccess = true;
        }
    } catch (error) {
        console.error('Password reset error:', error);
        state.value.isError = true;
        state.value.errorMessage =
            error.userMessage || 'Не удалось сбросить пароль. Попробуйте запросить новую ссылку.';
    } finally {
        state.value.isLoading = false;
    }
}

// Переход к странице входа
function goToLogin() {
    router.push('/');
}

// Запрос новой ссылки
function requestNewLink() {
    router.push('/forgot-password');
}
</script>

<template>
    <div class="background-container">
        <div class="form-container">
            <!-- Загрузка проверки токена -->
            <div v-if="state.isValidatingToken" class="loading-state">
                <div class="spinner"></div>
                <p>Проверка ссылки...</p>
            </div>

            <!-- Ошибка валидации токена -->
            <div v-else-if="!state.isTokenValid && state.isError" class="error-state">
                <div class="error-icon">✕</div>
                <h2>Ссылка недействительна</h2>
                <p class="error-description">{{ state.errorMessage }}</p>
                <p class="hint">
                    Возможные причины:
                    <br />• Ссылка истекла (действительна 1 час) <br />• Ссылка уже была
                    использована <br />• Ссылка повреждена
                </p>
                <button class="primary-btn" @click="requestNewLink">Запросить новую ссылку</button>
                <button class="secondary-btn" @click="goToLogin">Вернуться к входу</button>
            </div>

            <!-- Форма смены пароля -->
            <div v-else-if="state.isTokenValid && !state.isSuccess" class="reset-form">
                <h2>Создайте новый пароль</h2>
                <p class="description">
                    Для аккаунта: <strong>{{ state.email }}</strong>
                </p>

                <div class="input-container">
                    <label for="newPassword">Новый пароль</label>
                    <div class="password-input-wrapper">
                        <input
                            id="newPassword"
                            v-model="state.newPassword"
                            type="password"
                            placeholder="Введите новый пароль"
                            :disabled="state.isLoading"
                            @input="onPasswordInput"
                        />
                    </div>
                </div>

                <div class="password-requirements">
                    <div
                        class="requirement"
                        :class="{ valid: state.passwordRequirements.minLength }"
                    >
                        <span class="icon">{{
                            state.passwordRequirements.minLength ? '✓' : '○'
                        }}</span>
                        Минимум 8 символов
                    </div>
                    <div
                        class="requirement"
                        :class="{ valid: state.passwordRequirements.hasUpperCase }"
                    >
                        <span class="icon">{{
                            state.passwordRequirements.hasUpperCase ? '✓' : '○'
                        }}</span>
                        Одна заглавная буква
                    </div>
                    <div
                        class="requirement"
                        :class="{ valid: state.passwordRequirements.hasNumber }"
                    >
                        <span class="icon">{{
                            state.passwordRequirements.hasNumber ? '✓' : '○'
                        }}</span>
                        Одна цифра
                    </div>
                </div>

                <div class="input-container">
                    <label for="confirmPassword">Повторите пароль</label>
                    <input
                        id="confirmPassword"
                        v-model="state.confirmPassword"
                        type="password"
                        placeholder="Повторите новый пароль"
                        :disabled="state.isLoading"
                        @keyup.enter="onSubmit"
                    />
                    <div class="tooltip" :class="{ invalid: state.isError }">
                        {{ state.errorMessage }}
                    </div>
                </div>

                <button
                    class="primary-btn"
                    :disabled="state.isLoading"
                    :class="{ disabled: state.isLoading }"
                    @click.prevent="onSubmit"
                >
                    {{ state.isLoading ? 'Сохранение...' : 'Сменить пароль' }}
                </button>

                <button class="secondary-btn" @click.prevent="goToLogin">Отмена</button>
            </div>

            <!-- Успешное изменение -->
            <div v-else-if="state.isSuccess" class="success-state">
                <div class="success-icon">✓</div>
                <h2>Пароль успешно изменен!</h2>
                <p>Теперь вы можете войти в систему с новым паролем.</p>
                <button class="primary-btn" @click="goToLogin">Перейти к входу</button>
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
    padding: 20px;
}

.form-container {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
}

/* Состояние загрузки */
.loading-state {
    text-align: center;
    padding: 40px 20px;
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 20px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: #666;
    font-size: 16px;
}

/* Состояние ошибки */
.error-state {
    text-align: center;
}

.error-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: #fee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: #e74c3c;
}

.error-state h2 {
    color: #333;
    margin-bottom: 12px;
}

.error-description {
    color: #e74c3c;
    font-size: 15px;
    margin-bottom: 16px;
}

.hint {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    text-align: left;
    background: #f8f9fa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
}

/* Состояние успеха */
.success-state {
    text-align: center;
}

.success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: #d4edda;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: #28a745;
}

.success-state h2 {
    color: #333;
    margin-bottom: 12px;
}

.success-state p {
    color: #666;
    font-size: 15px;
    margin-bottom: 24px;
}

/* Форма */
.reset-form h2 {
    margin-bottom: 8px;
    color: #333;
}

.description {
    color: #666;
    font-size: 14px;
    margin-bottom: 24px;
}

.description strong {
    color: #333;
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

.password-input-wrapper {
    position: relative;
}

.input-container input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
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

/* Требования к паролю */
.password-requirements {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.requirement {
    display: flex;
    align-items: center;
    color: #999;
    font-size: 14px;
    margin-bottom: 8px;
    transition: color 0.2s;
}

.requirement:last-child {
    margin-bottom: 0;
}

.requirement.valid {
    color: #28a745;
}

.requirement .icon {
    margin-right: 8px;
    font-weight: bold;
    width: 20px;
}

/* Кнопки */
.primary-btn,
.secondary-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.primary-btn {
    background: #667eea;
    color: white;
    margin-bottom: 12px;
}

.primary-btn:hover:not(.disabled) {
    background: #5568d3;
}

.primary-btn.disabled {
    background: #ccc;
    cursor: not-allowed;
}

.secondary-btn {
    background: transparent;
    color: #666;
    border: 1px solid #ddd;
}

.secondary-btn:hover {
    background: #f5f5f5;
}

/* Адаптивность */
@media (max-width: 600px) {
    .form-container {
        padding: 30px 20px;
    }

    .error-icon,
    .success-icon {
        width: 60px;
        height: 60px;
        font-size: 30px;
    }
}
</style>
