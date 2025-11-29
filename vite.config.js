import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isDev = mode === 'development';

    // Генерация самоподписанного сертификата для HTTPS в dev-режиме
    const httpsConfig = isDev ? {
        key: generateDevCert().key,
        cert: generateDevCert().cert,
    } : false;

    return {
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: (tag) => tag.startsWith('custom-'),
                    },
                },
            }),
            vueJsx(),
            vueDevTools(),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        base: env.VITE_BASE_URL || '/comanaso/',
        server: {
            port: 5173,
            host: true,
            https: process.argv.includes('--https') ? httpsConfig : false,
            open: false,
            cors: true,
            proxy: {
                // Настройка прокси для API-запросов (когда будет сервер)
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:3000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        preview: {
            port: 8084,
            host: true,
            https: false,
            cors: true,
        },
        build: {
            target: 'esnext',
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: isDev,
            minify: !isDev ? 'esbuild' : false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vue-vendor': ['vue', 'vue-router', 'pinia'],
                        'chart-vendor': ['chart.js', 'vue-chartjs'],
                    },
                },
            },
            chunkSizeWarningLimit: 1000,
        },
        optimizeDeps: {
            include: ['vue', 'vue-router', 'pinia', 'chart.js', 'vue-chartjs'],
        },
    };
});

// Функция для генерации самоподписанного сертификата
function generateDevCert() {
    const certPath = path.resolve(process.cwd(), '.cert');
    const keyPath = path.join(certPath, 'key.pem');
    const certFilePath = path.join(certPath, 'cert.pem');

    // Проверяем существование сертификатов
    if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certFilePath),
        };
    }

    // Если сертификатов нет, создаём директорию и возвращаем false
    // Пользователь должен будет сгенерировать сертификаты вручную
    if (!fs.existsSync(certPath)) {
        fs.mkdirSync(certPath, { recursive: true });
    }

    console.warn('\n⚠️  HTTPS сертификаты не найдены!');
    console.warn('Для работы с HTTPS в dev-режиме выполните:');
    console.warn('\nWindows (PowerShell):');
    console.warn('  New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\LocalMachine\\My"');
    console.warn('\nLinux/Mac:');
    console.warn('  openssl req -x509 -newkey rsa:4096 -keyout .cert/key.pem -out .cert/cert.pem -days 365 -nodes -subj "/CN=localhost"\n');

    return { key: '', cert: '' };
}
