/**
 * Утилиты для валидации форм
 */

/**
 * Валидация логина
 * @param {string} login - логин для проверки
 * @returns {{isValid: boolean, error: string}} результат валидации
 */
export function validateLogin(login) {
    if (!login || login.trim().length === 0) {
        return {
            isValid: false,
            error: 'Логин обязателен для заполнения',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(login)) {
        return {
            isValid: false,
            error: 'Логин должен содержать только буквы и цифры',
        };
    }

    if (login.length < 3) {
        return {
            isValid: false,
            error: 'Логин должен содержать минимум 3 символа',
        };
    }

    if (login.length > 100) {
        return {
            isValid: false,
            error: 'Логин должен содержать не более 100 символов',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Валидация пароля
 * @param {string} password - пароль для проверки
 * @param {boolean} isOptional - является ли пароль опциональным (для обновления)
 * @returns {{isValid: boolean, error: string}} результат валидации
 */
export function validatePassword(password, isOptional = false) {
    if (isOptional && (!password || password.length === 0)) {
        return {
            isValid: true,
            error: '',
        };
    }

    if (!password || password.trim().length === 0) {
        return {
            isValid: false,
            error: 'Пароль обязателен для заполнения',
        };
    }

    if (password.length < 6) {
        return {
            isValid: false,
            error: 'Пароль должен содержать минимум 6 символов',
        };
    }

    if (password.length > 100) {
        return {
            isValid: false,
            error: 'Пароль должен содержать не более 100 символов',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Валидация имени пользователя
 * @param {string} name - имя для проверки
 * @returns {{isValid: boolean, error: string}} результат валидации
 */
export function validateName(name) {
    if (!name || name.trim().length === 0) {
        return {
            isValid: false,
            error: 'Имя обязательно для заполнения',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/.test(name)) {
        return {
            isValid: false,
            error: 'Имя должно содержать только буквы, цифры или пробелы',
        };
    }

    if (name.length < 2) {
        return {
            isValid: false,
            error: 'Имя должно содержать минимум 2 символа',
        };
    }

    if (name.length > 100) {
        return {
            isValid: false,
            error: 'Имя должно содержать не более 100 символов',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Валидация email
 * @param {string} email - email для проверки
 * @returns {{isValid: boolean, error: string}} результат валидации
 */
export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return {
            isValid: false,
            error: 'Email обязателен для заполнения',
        };
    }

    // Базовая проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Неверный формат email',
        };
    }

    if (email.length > 255) {
        return {
            isValid: false,
            error: 'Email должен содержать не более 255 символов',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}

/**
 * Валидация username (имя пользователя в системе)
 * @param {string} username - username для проверки
 * @returns {{isValid: boolean, error: string}} результат валидации
 */
export function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return {
            isValid: false,
            error: 'Имя пользователя обязательно для заполнения',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/.test(username)) {
        return {
            isValid: false,
            error: 'Имя пользователя должно содержать только буквы, цифры или пробелы',
        };
    }

    if (username.length < 3) {
        return {
            isValid: false,
            error: 'Имя пользователя должно содержать минимум 3 символа',
        };
    }

    if (username.length > 100) {
        return {
            isValid: false,
            error: 'Имя пользователя должно содержать не более 100 символов',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}
