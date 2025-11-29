# Comanaso

Vue 3 приложение для управления аккаунтами.

## Требования

- Node.js >= 18.x
- npm >= 9.x

## Установка

```bash
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
```
localStorage недоступен в Chrome
Chrome блокирует localStorage для небезопасных контекстов (HTTP). Решения:
Рекомендуется: Используйте npm run dev:https с самоподписанными сертификатами
Откройте Chrome с флагом: chrome.exe --unsafely-treat-insecure-origin-as-secure="http://localhost:5173"
```
# В настройках Chrome: chrome://flags/#unsafely-treat-insecure-origin-as-secure
