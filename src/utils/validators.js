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
            error: 'Login is required',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9]+$/.test(login)) {
        return {
            isValid: false,
            error: 'Login must include only letters and numbers',
        };
    }

    if (login.length < 3) {
        return {
            isValid: false,
            error: 'Login should be at least 3 symbols',
        };
    }

    if (login.length > 100) {
        return {
            isValid: false,
            error: 'Login should be no more than 100 symbols',
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
            error: 'Password is required',
        };
    }

    if (password.length < 6) {
        return {
            isValid: false,
            error: 'Password should be at least 6 symbols',
        };
    }

    if (password.length > 100) {
        return {
            isValid: false,
            error: 'Password should be no more than 100 symbols',
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
            error: 'Name is required',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/.test(name)) {
        return {
            isValid: false,
            error: 'Name must include letters, numbers or spaces',
        };
    }

    if (name.length < 2) {
        return {
            isValid: false,
            error: 'Name should be at least 2 symbols',
        };
    }

    if (name.length > 100) {
        return {
            isValid: false,
            error: 'Name should be no more than 100 symbols',
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
            error: 'Email is required',
        };
    }

    // Базовая проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Invalid email format',
        };
    }

    if (email.length > 255) {
        return {
            isValid: false,
            error: 'Email should be no more than 255 symbols',
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
            error: 'Username is required',
        };
    }

    if (!/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/.test(username)) {
        return {
            isValid: false,
            error: 'Username must include letters, numbers or spaces',
        };
    }

    if (username.length < 3) {
        return {
            isValid: false,
            error: 'Username should be at least 3 symbols',
        };
    }

    if (username.length > 100) {
        return {
            isValid: false,
            error: 'Username should be no more than 100 symbols',
        };
    }

    return {
        isValid: true,
        error: '',
    };
}