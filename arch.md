# АРХИТЕКТУРА ПРОЕКТА COMANASO

## 📋 КРАТКАЯ ВЕРСИЯ (для промптов)

### Описание проекта
**Comanaso** - Vue 3 SPA для анализа Telegram аккаунтов. Приложение позволяет подключать множественные Telegram аккаунты, анализировать диалоги и получать статистику.

### Технологический стек
- **Frontend**: Vue 3 (Composition API), Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Charts**: Chart.js + vue-chartjs
- **Styles**: CSS (scoped), CSS Variables
- **Dev Server**: HTTPS (самоподписанный сертификат)

### Архитектурные слои
```
┌─────────────────────────────────────┐
│   Presentation Layer (Views)        │
│   - FrontPageView (лендинг)         │
│   - MainPageView (layout)           │
│   - AccountView, AnalyticsView      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Component Layer                   │
│   - Forms, Buttons, Cards           │
│   - Tables, Charts, Modals          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   State Layer (Pinia Stores)        │
│   - auth, user, account             │
│   - dialogs, toast, localStorage    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Utils Layer                       │
│   - connection.js (API заглушки)    │
│   - dialogAnalytics.js              │
└─────────────────────────────────────┘
```

### Ключевые механизмы

1. **Аутентификация**: JWT токены в localStorage, route guards
2. **State Management**: Pinia с `$onAction` для реактивности
3. **Роутинг**: защищенные маршруты через [beforeEach](file://D:/projects/vue/comanaso/src/router/index.js#beforeEach)
4. **Уведомления**: централизованная система через [toast store](file://D:/projects/vue/comanaso/src/store/toast.js)
5. **Модальные окна**: управление через [dialogs store](file://D:/projects/vue/comanaso/src/store/dialogs.js)

### Основные паттерны

- **Composition API**: `reactive()`, `ref()`, `computed()`
- **Provide/Inject**: для управления overflow
- **Scoped Styles**: изолированные стили компонентов
- **CSS Variables**: централизованная цветовая палитра в [base.css](file://D:/projects/vue/comanaso/src/style/base.css)
- **Controller Pattern**: бизнес-логика в отдельных файлах ([controller.js](file://D:/projects/vue/comanaso/src/components/form/login/controller.js))

---

## 🗂️ ДЕТАЛЬНАЯ СТРУКТУРА ПРОЕКТА

### Корневая структура
```
comanaso/
├── public/                    # Статические файлы
│   └── favicon-*.png         # Иконки приложения
├── src/                      # Исходный код
│   ├── assets/              # Ресурсы (изображения, иконки)
│   ├── components/          # Переиспользуемые компоненты
│   ├── router/              # Конфигурация маршрутизации
│   ├── store/               # Pinia stores
│   ├── style/               # Глобальные стили
│   ├── utils/               # Утилиты и хелперы
│   ├── view/                # Страницы приложения
│   ├── App.vue              # Корневой компонент
│   └── main.js              # Точка входа
├── .env.local               # Переменные окружения
├── index.html               # HTML шаблон
├── jsconfig.json            # Конфигурация JavaScript
├── package.json             # Зависимости проекта
└── vite.config.js           # Конфигурация Vite
```

### Детализация `/src`

#### 📁 `/src/view` - Страницы приложения

**[FrontPageView.vue](file://D:/projects/vue/comanaso/src/view/FrontPageView.vue)** - Лендинг (неавторизованные пользователи)
- Секции: главная, шаги использования, безопасность
- Форма входа/регистрации
- Адаптивный дизайн с медиа-запросами

**[MainPageView.vue](file://D:/projects/vue/comanaso/src/view/MainPageView.vue)** - Основной layout (авторизованные)
- Сайдбар с навигацией
- Выдвижное меню для мобильных
- `<router-view>` для вложенных страниц

**[AccountView.vue](file://D:/projects/vue/comanaso/src/view/AccountView.vue)** - Управление аккаунтами
- Список подключенных Telegram аккаунтов
- Добавление/удаление аккаунтов
- Редактирование названий

**[AnalyticsView.vue](file://D:/projects/vue/comanaso/src/view/AnalyticsView.vue)** - Аналитика диалогов
- Таблица диалогов с фильтрацией
- Круговая диаграмма типов диалогов
- Пагинация и сортировка

**[SettingsView.vue](file://D:/projects/vue/comanaso/src/view/SettingsView.vue)** - Настройки (заглушка)

#### 📁 `/src/components` - Компоненты

**`/account`** - Управление аккаунтами
- [AccountCard.vue](file://D:/projects/vue/comanaso/src/components/account/AccountCard.vue) - карточка с формой редактирования
- [AccountStatus.vue](file://D:/projects/vue/comanaso/src/components/account/elements/AccountStatus.vue) - индикатор статуса (online/offline)

**`/button`** - Кнопки действий
- [AddAccount.vue](file://D:/projects/vue/comanaso/src/components/button/AddAccount.vue) - добавление аккаунта
- [LogOut.vue](file://D:/projects/vue/comanaso/src/components/button/LogOut.vue) - выход из системы
- [UpdateButton.vue](file://D:/projects/vue/comanaso/src/components/button/UpdateButton.vue) - обновление данных

**`/chart`** - Визуализация данных
- [DialogPie.vue](file://D:/projects/vue/comanaso/src/components/chart/DialogPie.vue) - круговая диаграмма (Chart.js)

**`/form`** - Формы
- [FormLogin.vue](file://D:/projects/vue/comanaso/src/components/form/login/FormLogin.vue) - вход/регистрация
- [controller.js](file://D:/projects/vue/comanaso/src/components/form/login/controller.js) - контроллер валидации и отправки

**`/front-page-section`** - Секции лендинга
- [FirstSection.vue](file://D:/projects/vue/comanaso/src/components/front-page-section/FirstSection.vue) - главная секция
- [SecondSection.vue](file://D:/projects/vue/comanaso/src/components/front-page-section/SecondSection.vue) - шаги использования
- [ThirdSection.vue](file://D:/projects/vue/comanaso/src/components/front-page-section/ThirdSection.vue) - безопасность
- [SecurityInfoSlot.vue](file://D:/projects/vue/comanaso/src/components/front-page-section/elements/SecurityInfoSlot.vue) - слот для информации
- [SecurityIcon.vue](file://D:/projects/vue/comanaso/src/components/front-page-section/elements/SecurityIcon.vue) - SVG иконка

**`/modal`** - Модальные окна
- [DetailPopup.vue](file://D:/projects/vue/comanaso/src/components/modal/DetailPopup.vue) - детали диалога
- [Confirm.vue](file://D:/projects/vue/comanaso/src/components/modal/Confirm.vue) - подтверждение с input

**`/table`** - Таблицы
- [DialogTable.vue](file://D:/projects/vue/comanaso/src/components/table/DialogTable.vue) - таблица диалогов с пагинацией, сортировкой, фильтрацией

**`/toast`** - Уведомления
- [Toast.vue](file://D:/projects/vue/comanaso/src/components/toast/Toast.vue) - система уведомлений

#### 📁 `/src/store` - Pinia Stores

**[auth.js](file://D:/projects/vue/comanaso/src/store/auth.js)** - Аутентификация
```javascript
state: { token, isAuth }
actions: { login(), logout(), checkAuth() }
```

**[user.js](file://D:/projects/vue/comanaso/src/store/user.js)** - Данные пользователя
```javascript
state: { username, email }
actions: { setUser(), clearUser() }
```

**[account.js](file://D:/projects/vue/comanaso/src/store/account.js)** - Telegram аккаунты
```javascript
state: { accounts: [], selectedAccount }
actions: { addAccount(), removeAccount(), updateAccount() }
```

**[dialogs.js](file://D:/projects/vue/comanaso/src/store/dialogs.js)** - Диалоги и модальные окна
```javascript
state: { dialogs: [], detailPopup, confirmPopup }
actions: { setDialogs(), openDetail(), openConfirm() }
```

**[toast.js](file://D:/projects/vue/comanaso/src/store/toast.js)** - Уведомления
```javascript
state: { toasts: [] }
actions: { addToast(), removeToast() }
```

**[localStorage.js](file://D:/projects/vue/comanaso/src/store/localStorage.js)** - Работа с localStorage
```javascript
actions: { saveToStorage(), loadFromStorage(), clearStorage() }
```

**[storeController.js](file://D:/projects/vue/comanaso/src/store/storeController.js)** - Координатор stores
- Инициализация всех stores
- Синхронизация состояния

#### 📁 `/src/router` - Маршрутизация

**[index.js](file://D:/projects/vue/comanaso/src/router/index.js)** - Конфигурация роутера
```javascript
routes:
  / → FrontPageView (public)
  /main → MainPageView (protected)
    /main/account → AccountView
    /main/analytics → AnalyticsView
    /main/settings → SettingsView

beforeEach: проверка токена, редирект
```

#### 📁 `/src/utils` - Утилиты

**[connection.js](file://D:/projects/vue/comanaso/src/utils/connection.js)** - API заглушки
```javascript
// Функции для будущего серверного API:
connectAccount()
disconnectAccount()
getDialogs()
updateAccountName()
```
⚠️ **Важно**: gramJS удален, переход на серверную архитектуру

**[dialogAnalytics.js](file://D:/projects/vue/comanaso/src/utils/dialogAnalytics.js)** - Аналитика диалогов
```javascript
getDialogTypeStats() // Подсчет по типам (users, groups, channels, bots)
```

#### 📁 `/src/style` - Стили

**[base.css](file://D:/projects/vue/comanaso/src/style/base.css)** - CSS переменные
```css
:root {
  --color-background: #0a0e27;
  --color-primary: #667eea;
  --color-text: #e2e8f0;
  /* + 20+ переменных */
}
```
- Цветовая палитра
- Кастомный scrollbar
- Базовые стили

**[main.css](file://D:/projects/vue/comanaso/src/style/main.css)** - Глобальные стили
- Reset стилей
- Типографика
- Утилитарные классы

---

## 🔧 МЕХАНИЗМЫ И ПАТТЕРНЫ

### 1. Аутентификация

**Поток:**
```
1. Пользователь вводит данные в FormLogin
2. controller.js валидирует и отправляет запрос
3. auth store сохраняет токен в localStorage
4. Router guard проверяет токен при навигации
5. При выходе токен удаляется
```

**Файлы:**
- [FormLogin.vue](file://D:/projects/vue/comanaso/src/components/form/login/FormLogin.vue) - UI формы
- [controller.js](file://D:/projects/vue/comanaso/src/components/form/login/controller.js) - логика валидации
- [auth.js](file://D:/projects/vue/comanaso/src/store/auth.js) - управление токеном
- [router/index.js](file://D:/projects/vue/comanaso/src/router/index.js) - защита маршрутов

### 2. State Management (Pinia)

**Паттерн реактивности:**
```javascript
// В компоненте
const accountStore = useAccountStore()

accountStore.$onAction(({ name, after }) => {
  after(() => {
    if (name === 'addAccount') {
      // Обновить UI
    }
  })
})
```

**Преимущества:**
- Централизованное состояние
- Реактивные обновления
- Легкое тестирование
- TypeScript поддержка (опционально)

### 3. Модальные окна

**Управление через store:**
```javascript
// dialogs store
state: {
  detailPopup: { isOpen: false, data: null },
  confirmPopup: { isOpen: false, data: null }
}

// Открытие
dialogsStore.openDetail(dialogData)

// Компонент слушает изменения
watch(() => dialogsStore.detailPopup.isOpen, ...)
```

**Компоненты:**
- [DetailPopup.vue](file://D:/projects/vue/comanaso/src/components/modal/DetailPopup.vue) - детали диалога
- [Confirm.vue](file://D:/projects/vue/comanaso/src/components/modal/Confirm.vue) - подтверждение действий

### 4. Система уведомлений (Toast)

**Архитектура:**
```javascript
// toast store
state: { toasts: [] }

addToast({ message, type, duration })
  → добавляет в массив
  → автоудаление через setTimeout

// Toast.vue рендерит список
<div v-for="toast in toastStore.toasts">
```

**Использование:**
```javascript
toastStore.addToast({
  message: 'Аккаунт добавлен',
  type: 'success',
  duration: 3000
})
```

### 5. Таблица диалогов

**Функционал [DialogTable.vue](file://D:/projects/vue/comanaso/src/components/table/DialogTable.vue):**
- **Пагинация**: `currentPage`, `itemsPerPage`
- **Сортировка**: по имени, типу, дате
- **Фильтрация**: по типу диалога (users, groups, channels, bots)
- **Поиск**: по названию
- **Детали**: клик открывает [DetailPopup.vue](file://D:/projects/vue/comanaso/src/components/modal/DetailPopup.vue)

**Computed свойства:**
```javascript
filteredDialogs → фильтрация по типу
searchedDialogs → поиск по названию
sortedDialogs → сортировка
paginatedDialogs → текущая страница
```

### 6. Аналитика диалогов

**[dialogAnalytics.js](file://D:/projects/vue/comanaso/src/utils/dialogAnalytics.js):**
```javascript
getDialogTypeStats(dialogs) {
  return {
    users: count,
    groups: count,
    channels: count,
    bots: count
  }
}
```

**Визуализация в [DialogPie.vue](file://D:/projects/vue/comanaso/src/components/chart/DialogPie.vue):**
- Chart.js Pie chart
- Цветовая палитра из CSS переменных
- Легенда с процентами

### 7. Адаптивный дизайн

**Breakpoints:**
```css
/* Mobile */
@media (max-width: 768px) {
  /* Выдвижное меню, вертикальные карточки */
}

/* Tablet */
@media (max-width: 1024px) {
  /* Уменьшенные отступы */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Полный layout */
}
```

**Механизм выдвижного меню:**
```javascript
// MainPageView.vue
const isSidebarOpen = ref(false)

// Provide для дочерних компонентов
provide('toggleSidebar', () => {
  isSidebarOpen.value = !isSidebarOpen.value
})
```

### 8. Управление overflow

**Паттерн Provide/Inject:**
```javascript
// FrontPageView.vue
provide('setOverflow', (value) => {
  document.body.style.overflow = value
})

// FormLogin.vue (при открытии)
inject('setOverflow')('hidden')
```

**Цель**: предотвратить скролл body при открытых модальных окнах

---

## 🚀 ПЕРЕХОД НА СЕРВЕРНУЮ АРХИТЕКТУРУ

### Текущее состояние
- ❌ **gramJS удален** (клиентская библиотека Telegram)
- ⚠️ **[connection.js](file://D:/projects/vue/comanaso/src/utils/connection.js) содержит заглушки**
- 🔄 **Планируется серверный API**

### Будущая архитектура

**Backend (планируется):**
```
Node.js/Python сервер
  ↓
Telegram API (через gramJS/Telethon)
  ↓
REST/GraphQL API
  ↓
Frontend (текущий проект)
```

**Изменения в [connection.js](file://D:/projects/vue/comanaso/src/utils/connection.js):**
```javascript
// Вместо заглушек:
export async function connectAccount(phone) {
  const response = await fetch('/api/accounts/connect', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ phone })
  })
  return response.json()
}
```

**Новые эндпоинты (примерный список):**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout

GET    /api/accounts
POST   /api/accounts/connect
DELETE /api/accounts/:id
PATCH  /api/accounts/:id

GET    /api/dialogs/:accountId
GET    /api/dialogs/:accountId/:dialogId
```

---

## 📦 ЗАВИСИМОСТИ

### Production
```json
{
  "vue": "^3.5.13",
  "vue-router": "^4.4.5",
  "pinia": "^2.2.6",
  "chart.js": "^4.4.7",
  "vue-chartjs": "^5.3.2"
}
```

### Development
```json
{
  "vite": "^6.0.1",
  "@vitejs/plugin-vue": "^5.2.1",
  "vite-plugin-basic-ssl": "^1.1.0"
}
```

### Конфигурация Vite

**[vite.config.js](file://D:/projects/vue/comanaso/vite.config.js):**
- HTTPS сервер (самоподписанный сертификат)
- Алиасы путей (`@` → `src/`)
- Плагин Vue
- Порт: 5173

---

## 🎨 ДИЗАЙН-СИСТЕМА

### Цветовая палитра ([base.css](file://D:/projects/vue/comanaso/src/style/base.css))

**Основные цвета:**
```css
--color-background: #0a0e27      /* Темный фон */
--color-background-soft: #1a1f3a /* Мягкий фон */
--color-primary: #667eea         /* Основной акцент */
--color-primary-hover: #5568d3   /* Hover состояние */
--color-success: #48bb78         /* Успех */
--color-danger: #f56565          /* Ошибка */
--color-warning: #ed8936         /* Предупреждение */
```

**Текст:**
```css
--color-text: #e2e8f0            /* Основной текст */
--color-text-muted: #a0aec0      /* Приглушенный текст */
```

**Границы и тени:**
```css
--color-border: #2d3748
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Типографика

**Шрифты:**
- Основной: system-ui, -apple-system, sans-serif
- Моноширинный: 'Courier New', monospace

**Размеры:**
```css
font-size: 16px (base)
line-height: 1.6
```

### Компонентные стили

**Кнопки:**
```css
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background: var(--color-primary);
  transition: all 0.3s ease;
}
```

**Карточки:**
```css
.card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
}
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Текущие меры

1. **JWT токены**: хранятся в localStorage
2. **Route guards**: проверка авторизации
3. **HTTPS**: для разработки (самоподписанный сертификат)
4. **CORS**: настройка на сервере (будущее)

### Рекомендации для production

1. **HttpOnly cookies** вместо localStorage для токенов
2. **Refresh tokens** для обновления сессии
3. **CSP headers** (Content Security Policy)
4. **Rate limiting** на API
5. **Input sanitization** на сервере
6. **SSL сертификат** от доверенного CA

---

## 📝 СОГЛАШЕНИЯ О КОДЕ

### Именование

**Компоненты:**
- PascalCase: `AccountCard.vue`, `DialogTable.vue`
- Префиксы: `Form*`, `Button*`, `Modal*`

**Stores:**
- camelCase: `auth.js`, `dialogs.js`
- Суффикс Store в использовании: `useAuthStore()`

**Функции:**
- camelCase: `connectAccount()`, `getDialogs()`
- Глаголы в начале: `add*`, `remove*`, `update*`

**Переменные:**
- camelCase: `isAuth`, `selectedAccount`
- Boolean с префиксом `is*`, `has*`, `should*`

### Структура компонента

```vue
<script setup>
// 1. Imports
import { ref, computed } from 'vue'
import { useStore } from '@/store/...'

// 2. Props/Emits
const props = defineProps({...})
const emit = defineEmits([...])

// 3. Stores
const store = useStore()

// 4. Reactive state
const data = ref(null)

// 5. Computed
const computed = computed(() => ...)

// 6. Methods
function method() {...}

// 7. Lifecycle hooks
onMounted(() => {...})
</script>

<template>
  <!-- Разметка -->
</template>

<style scoped>
/* Стили */
</style>
```

### Комментарии

```javascript
// Однострочный комментарий для простых пояснений

/**
 * Многострочный комментарий для функций
 * @param {string} phone - Номер телефона
 * @returns {Promise<Object>} Данные аккаунта
 */
```

---

## 🧪 ТЕСТИРОВАНИЕ (рекомендации)

### Unit тесты (будущее)

**Инструменты:**
- Vitest (встроен в Vite)
- @vue/test-utils

**Что тестировать:**
- Stores: actions, getters
- Utils: dialogAnalytics, валидация
- Компоненты: props, events, computed

### E2E тесты (будущее)

**Инструменты:**
- Playwright / Cypress

**Сценарии:**
- Регистрация/вход
- Добавление аккаунта
- Просмотр аналитики
- Выход из системы

---

## 🚀 РАЗВЕРТЫВАНИЕ

### Development

```bash
npm install
npm run dev
# → https://localhost:5173
```

### Production Build

```bash
npm run build
# → dist/
```

### Переменные окружения

**[.env.local](file://D:/projects/vue/comanaso/.env.local):**
```
VITE_API_URL=https://api.example.com
```

**Использование:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

### Документация

- [Vue 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Chart.js](https://www.chartjs.org/)
- [Vite](https://vitejs.dev/)

### Полезные ссылки

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia Best Practices](https://pinia.vuejs.org/cookbook/)
- [Vue Router Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html)

---

## 🎯 ROADMAP (предложения)

### Краткосрочные задачи

1. ✅ Удалить gramJS (выполнено)
2. 🔄 Реализовать серверный API
3. 🔄 Подключить реальные эндпоинты в [connection.js](file://D:/projects/vue/comanaso/src/utils/connection.js)
4. ⏳ Добавить обработку ошибок API
5. ⏳ Реализовать refresh tokens

### Среднесрочные задачи

1. ⏳ Добавить unit тесты (Vitest)
2. ⏳ Настроить CI/CD
3. ⏳ Оптимизировать bundle size
4. ⏳ Добавить PWA поддержку
5. ⏳ Реализовать темную/светлую тему

### Долгосрочные задачи

1. ⏳ Миграция на TypeScript
2. ⏳ Добавить E2E тесты
3. ⏳ Интернационализация (i18n)
4. ⏳ Расширенная аналитика (графики, экспорт)
5. ⏳ Мобильное приложение (Capacitor)

---

## 📄 CHANGELOG

### v1.0.0 (текущая версия)
- ✅ Базовая архитектура Vue 3 + Pinia
- ✅ Аутентификация с JWT
- ✅ Управление Telegram аккаунтами (UI)
- ✅ Аналитика диалогов с визуализацией
- ✅ Адаптивный дизайн
- ✅ Система уведомлений
- ⚠️ Удален gramJS (переход на серверный API)

---

## 💡 СОВЕТЫ ДЛЯ ПРОМПТОВ

### Как использовать этот документ

**Для общих вопросов:**
```
"Используя архитектуру проекта Comanaso (Vue 3 + Pinia),
объясни как работает аутентификация"
```

**Для добавления функционала:**
```
"В проекте Comanaso нужно добавить экспорт диалогов в CSV.
Учитывай существующую структуру stores и компонентов"
```

**Для рефакторинга:**
```
"Проект Comanaso использует Composition API и Pinia.
Оптимизируй компонент DialogTable.vue"
```

### Ключевые термины для контекста

- **Stores**: auth, user, account, dialogs, toast
- **Views**: FrontPage, MainPage, Account, Analytics
- **Utils**: connection (API заглушки), dialogAnalytics
- **Паттерны**: Composition API, Provide/Inject, $onAction
- **Стек**: Vue 3, Pinia, Vue Router, Chart.js, Vite

---

**Документ создан**: 2024
**Версия**: 1.0.0
**Проект**: Comanaso - Telegram Analytics Platform
