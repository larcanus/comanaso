import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.resolve(__dirname, '..', '.cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Создаём директорию для сертификатов
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
    console.log('✅ Создана директория .cert/');
}

// Проверяем, существуют ли уже сертификаты
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('⚠️  Сертификаты уже существуют!');
    console.log('Для пересоздания удалите файлы в .cert/ и запустите скрипт снова.\n');
    process.exit(0);
}

console.log('🔐 Генерация самоподписанных сертификатов для localhost...\n');

// Функция поиска OpenSSL в стандартных местах Windows
function findOpenSSL() {
    const possiblePaths = [
        'C:\\Program Files\\OpenSSL-Win64\\bin\\openssl.exe',
        'C:\\Program Files\\OpenSSL\\bin\\openssl.exe',
        'C:\\OpenSSL-Win64\\bin\\openssl.exe',
        'C:\\Program Files (x86)\\OpenSSL-Win64\\bin\\openssl.exe',
    ];

    // Сначала проверяем, доступен ли openssl в PATH
    try {
        execSync('openssl version', { stdio: 'ignore' });
        return 'openssl'; // Найден в PATH
    } catch (error) {
        // Ищем в стандартных местах
        for (const opensslPath of possiblePaths) {
            if (fs.existsSync(opensslPath)) {
                console.log(`✅ OpenSSL найден: ${opensslPath}\n`);
                return `"${opensslPath}"`;
            }
        }
    }

    return null;
}

// Основная логика
try {
    const opensslCmd = findOpenSSL();

    if (!opensslCmd) {
        console.error('❌ OpenSSL не найден в системе!\n');
        console.error('Варианты решения:\n');
        console.error('1. Установите OpenSSL:');
        console.error('   https://slproweb.com/products/Win32OpenSSL.html');
        console.error('   Рекомендуется: Win64 OpenSSL v3.x.x Light\n');
        console.error('2. После установки добавьте в PATH:');
        console.error('   C:\\Program Files\\OpenSSL-Win64\\bin\n');
        console.error('3. Перезапустите терминал/IDE\n');
        process.exit(1);
    }

    // Генерируем сертификаты через OpenSSL
    console.log('📝 Генерация сертификатов через OpenSSL...\n');

    // Шаг 1: Генерируем приватный ключ в традиционном RSA формате
    console.log('1️⃣  Генерация приватного ключа...');
    const keyCommand = `${opensslCmd} genrsa -out "${keyPath}" 2048`;
    execSync(keyCommand, { stdio: 'pipe' });
    console.log('   ✅ Ключ создан\n');

    // Шаг 2: Создаём конфигурационный файл для SAN (Subject Alternative Names)
    const configPath = path.join(certDir, 'openssl.cnf');
    const configContent = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C = RU
ST = Moscow
L = Moscow
O = Development
OU = Development
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;
    fs.writeFileSync(configPath, configContent.trim());
    console.log('2️⃣  Конфигурация создана\n');

    // Шаг 3: Генерируем сертификат с использованием существующего ключа
    console.log('3️⃣  Генерация сертификата...');
    const certCommand = `${opensslCmd} req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}" -extensions v3_req`;
    execSync(certCommand, { stdio: 'pipe' });
    console.log('   ✅ Сертификат создан\n');

    // Удаляем временный конфиг
    fs.unlinkSync(configPath);

    // Проверяем созданные файлы
    console.log('4️⃣  Проверка сертификатов...');
    const keyInfo = execSync(`${opensslCmd} rsa -in "${keyPath}" -check -noout`, {
        encoding: 'utf8',
    });
    const certInfo = execSync(
        `${opensslCmd} x509 -in "${certPath}" -text -noout | findstr "Subject:"`,
        { encoding: 'utf8', shell: 'cmd.exe' }
    );

    console.log('   ✅ Ключ валиден');
    console.log('   ✅ Сертификат валиден\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Сертификаты успешно созданы!');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📁 Расположение:');
    console.log(`   Ключ:        ${keyPath}`);
    console.log(`   Сертификат:  ${certPath}\n`);
    console.log('⚠️  Важно: Добавьте сертификат в доверенные в вашем браузере!\n');
    console.log('📖 Как добавить в доверенные (Windows):\n');
    console.log('   1. Откройте файл: .cert/cert.pem');
    console.log('   2. Нажмите "Установить сертификат"');
    console.log('   3. Выберите "Текущий пользователь"');
    console.log('   4. "Поместить все сертификаты в следующее хранилище"');
    console.log('   5. Выберите "Доверенные корневые центры сертификации"');
    console.log('   6. Завершите установку\n');
    console.log('🚀 Теперь можно запустить: npm run dev:https\n');
    console.log('═══════════════════════════════════════════════════════════\n');
} catch (error) {
    console.error('\n❌ Ошибка при генерации сертификатов:', error.message);
    console.error('\n💡 Попробуйте создать сертификаты вручную:\n');
    console.error('   1. Генерация ключа:');
    console.error(`      openssl genrsa -out "${keyPath}" 2048\n`);
    console.error('   2. Генерация сертификата:');
    console.error(
        `      openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/CN=localhost"\n`
    );
    process.exit(1);
}
