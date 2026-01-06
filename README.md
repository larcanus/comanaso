# Comanaso - Telegram Analytics Platform

> Современная платформа для анализа Telegram-аккаунтов с AI-инсайтами

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-2.2-FFD859)
![License](https://img.shields.io/badge/license-MIT-blue)

## О проекте

**Comanaso** — это веб-сервис для анализа Telegram-аккаунтов. Платформа позволяет:

- Подключать Telegram-аккаунты через безопасную сессию (Telethon 1.42.0+)
- Анализировать статистику диалогов (пользователи, группы, каналы, боты)
- Получать AI-инсайты о вашей активности
- Визуализировать данные через интерактивные графики
- Работать с данными локально без передачи на сервер

## Быстрый старт

### Требования

- Node.js >= 25.0.0
- npm >= 11.0.0

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/larcanus/comanaso.git
cd comanaso

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev
```

Приложение будет доступно по адресу: `https://localhost:5173`

⚠️ **Важно:** Dev-сервер использует самоподписанный SSL-сертификат. При первом запуске браузер покажет предупреждение.

### Production Build

```bash
# Сборка для production
npm run build

# Предпросмотр production-сборки
npm run preview
```

## Архитектура

### Технологический стек

| Технология | Версия | Назначение |
|-----------|--------|------------|
| Vue 3 | 3.5.13 | UI Framework (Composition API) |
| Vite | 6.0.1 | Build Tool & Dev Server |
| Pinia | 2.2.6 | State Management |
| Vue Router | 4.4.5 | Routing |
| Chart.js | 4.4.7 | Data Visualization |
| vue-chartjs | 5.3.2 | Vue wrapper для Chart.js |

### Структура проекта

```
comanaso/
├── src/
│   ├── assets/          # Статические ресурсы (изображения, иконки)
│   ├── components/      # Переиспользуемые компоненты
│   │   ├── account/     # Компоненты управления аккаунтами
│   │   ├── button/      # Кнопки действий
│   │   ├── card/        # Элементы карточек
│   │   ├── chart/       # Графики и диаграммы
│   │   ├── common/      # Общие компоненты (FieldInfoButton)
│   │   ├── form/        # Формы (логин, регистрация)
│   │   ├── modal/       # Модальные окна
│   │   ├── progress/    # Элемент прогресс-бара
│   │   ├── table/       # Таблицы данных
│   │   └── toast/       # Система уведомлений
│   ├── composables/     # 
│   ├── constants/       # Константы (описания полей)
│   ├── router/          # Конфигурация маршрутизации
│   ├── services/        # 
│   ├── store/           # Pinia stores
│   │   ├── auth.js      # Аутентификация
│   │   ├── user.js      # Данные пользователя
│   │   ├── account.js   # Telegram-аккаунты
│   │   ├── dialogs.js   # Диалоги и модальные окна
│   │   └── toast.js     # Уведомления
│   ├── style/           # Глобальные стили
│   ├── utils/           # Утилиты и хелперы
│   ├── view/            # Страницы приложения
│   ├── App.vue          # Корневой компонент
│   └── main.js          # Точка входа
├── public/              # Публичные файлы
└── vite.config.js       # Конфигурация Vite
```

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
│   - dialogs, toast                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Utils Layer                       │
│   - dialogAnalytics.js              │
└─────────────────────────────────────┘
```

## Безопасность

### Текущие меры
- JWT токены для аутентификации
- Route guards для защиты маршрутов
- HTTPS в dev-режиме
- Локальное хранение данных

## Разработка

### Соглашения о коде

**Именование:**
- Компоненты: PascalCase (`AccountCard.vue`)
- Stores: camelCase (`auth.js`)
- Функции: camelCase с глаголом (`connectAccount()`)
- Переменные: camelCase, boolean с `is*`, `has*`

**Структура компонента:**
```vue
<script setup>
// 1. Imports
// 2. Props/Emits
// 3. Stores
// 4. Reactive state
// 5. Computed
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
  <!-- Разметка -->
</template>

<style scoped>
/* Стили */
</style>
```

### Полезные команды

```bash
# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build

# Предпросмотр production-сборки
npm run preview

# Линтинг (если настроен)
npm run lint
```

## 🗺️ Roadmap

### ✅ Реализовано
- [x] Базовая аутентификация
- [x] Управление Telegram-аккаунтами
- [x] Статистическая аналитика диалогов
- [x] Визуализация данных (Chart.js)
- [x] Адаптивный дизайн
- [x] Система уведомлений

### 🚧 В разработке
- [ ] AI-аналитика диалогов
- [ ] Экспорт данных (CSV, JSON)
- [ ] Расширенные фильтры
- [ ] Темная/светлая тема
- [ ] Мультиязычность (i18n)
- [ ] Unit & E2E тесты

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

