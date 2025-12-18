import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VueDevTools from 'vite-plugin-vue-devtools';
import fs from 'node:fs';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isDev = mode === 'development';

    // Проверяем, нужно ли использовать HTTPS (только если явно указано)
    const useHttps = process.env.VITE_USE_HTTPS === 'true';

    // Получаем конфигурацию HTTPS если нужно
    const httpsConfig = useHttps && isDev ? getHttpsConfig() : false;

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
            VueDevTools(),
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
            https: httpsConfig,
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
        define: {
            __VUE_PROD_DEVTOOLS__: true,
            __VUE_OPTIONS_API__: true,
        },
    };
});

// Функция для получения конфигурации HTTPS
function getHttpsConfig() {
    const certPath = path.resolve(process.cwd(), '.cert');
    const keyPath = path.join(certPath, 'key.pem');
    const certFilePath = path.join(certPath, 'cert.pem');

    // Проверяем существование сертификатов
    if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
        console.log('✅ HTTPS сертификаты найдены, запуск с HTTPS...\n');
        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certFilePath),
        };
    }

    // Если сертификатов нет, показываем предупреждение и возвращаем false
    console.warn('\n⚠️  HTTPS сертификаты не найдены!');
    console.warn('📁 Ожидаемое расположение: .cert/key.pem и .cert/cert.pem\n');
    console.warn('Для генерации сертификатов выполните:');
    console.warn('  npm run cert:generate\n');
    console.warn('Или вручную:');
    console.warn('\n🪟 Windows (PowerShell от администратора):');
    console.warn(
        '  $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\CurrentUser\\My"'
    );
    console.warn('  $pwd = ConvertTo-SecureString -String "password" -Force -AsPlainText');
    console.warn(
        '  Export-PfxCertificate -Cert $cert -FilePath "$PWD\\.cert\\cert.pfx" -Password $pwd'
    );
    console.warn('  # Затем конвертируйте PFX в PEM с помощью OpenSSL');
    console.warn('\n🐧 Linux/Mac:');
    console.warn('  npm run cert:generate\n');
    console.warn('⚠️  Запуск без HTTPS. Используйте npm run dev:https для HTTPS.\n');

    // Возвращаем false, чтобы использовать HTTP
    return false;
}
