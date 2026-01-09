import logger from '../utils/logger.js';

/**
 * Сервис шифрования JWT токенов с использованием Web Crypto API
 * Ключ генерируется на основе fingerprint браузера для стабильности между сессиями
 */
class CryptoService {
    constructor() {
        this.encryptionKey = null;
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
    }

    /**
     * Проверка доступности Web Crypto API
     * @returns {boolean}
     */
    isSupported() {
        return !!(window.crypto && window.crypto.subtle);
    }

    /**
     * Получить fingerprint браузера для генерации стабильного ключа
     * @returns {Promise<string>}
     */
    async getBrowserFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!window.sessionStorage,
            !!window.localStorage,
        ];

        // Добавляем canvas fingerprint для большей уникальности
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser Fingerprint', 2, 2);
        components.push(canvas.toDataURL());

        const fingerprint = components.join('###');

        // Хешируем fingerprint для получения стабильного ключа
        const encoder = new TextEncoder();
        const data = encoder.encode(fingerprint);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    /**
     * Генерация ключа шифрования на основе fingerprint
     * @returns {Promise<CryptoKey>}
     */
    async generateKey() {
        try {
            const fingerprint = await this.getBrowserFingerprint();

            // Используем fingerprint как основу для ключа
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(fingerprint),
                'PBKDF2',
                false,
                ['deriveBits', 'deriveKey']
            );

            // Генерируем стабильный ключ через PBKDF2
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode('comanaso-jwt-salt-v1'), // Статичная соль для стабильности
                    iterations: 100000,
                    hash: 'SHA-256',
                },
                keyMaterial,
                { name: this.algorithm, length: this.keyLength },
                false,
                ['encrypt', 'decrypt']
            );

            this.encryptionKey = key;
            logger.info('🔐 Стабильный ключ шифрования сгенерирован');
            return key;
        } catch (error) {
            logger.error('Ошибка генерации ключа:', error);
            throw new Error('Не удалось сгенерировать ключ шифрования');
        }
    }

    /**
     * Получить ключ шифрования (генерирует при первом вызове)
     * @returns {Promise<CryptoKey>}
     */
    async getKey() {
        if (!this.encryptionKey) {
            await this.generateKey();
        }
        return this.encryptionKey;
    }

    /**
     * Шифрование данных
     * @param {string} data - Данные для шифрования
     * @returns {Promise<string>} Зашифрованные данные в base64
     */
    async encrypt(data) {
        try {
            const key = await this.getKey();
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);

            // Генерируем IV (initialization vector)
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Шифруем данные
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                },
                key,
                dataBuffer
            );

            // Объединяем IV и зашифрованные данные
            const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedBuffer), iv.length);

            // Конвертируем в base64
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Ошибка шифрования:', error);

            return data;
        }
    }

    /**
     * Дешифрование данных
     * @param {string} encryptedData - Зашифрованные данные в base64
     * @returns {Promise<string>} Расшифрованные данные
     */
    async decrypt(encryptedData) {
        try {
            const key = await this.getKey();

            // Декодируем из base64
            const combined = new Uint8Array(
                atob(encryptedData)
                    .split('')
                    .map((char) => char.charCodeAt(0))
            );

            // Извлекаем IV и зашифрованные данные
            const iv = combined.slice(0, 12);
            const encryptedBuffer = combined.slice(12);

            // Дешифруем
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                },
                key,
                encryptedBuffer
            );

            // Конвертируем обратно в строку
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Ошибка дешифрования:', error);

            return encryptedData;
        }
    }

    /**
     * Очистка ключа из памяти
     */
    clearKey() {
        if (this.encryptionKey) {
            this.encryptionKey = null;
            console.info('🔓 Ключ шифрования очищен из памяти');
        }
    }
}

export const cryptoService = new CryptoService();
