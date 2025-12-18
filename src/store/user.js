import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    // State - основные данные
    const id = ref(null);
    const firstName = ref('');
    const lastName = ref('');
    const username = ref('');
    const phone = ref('');
    const bio = ref('');
    const avatar = ref('');
    const photo = ref(null); // Полный объект фото

    // State - флаги и статусы
    const isBot = ref(false);
    const isPremium = ref(false);
    const isVerified = ref(false);
    const langCode = ref(null);
    const status = ref(null); // Объект со статусом { type, wasOnline }

    // Actions
    function setUserData(userData) {
        // Основные данные
        if (userData.id !== undefined) id.value = userData.id;
        if (userData.firstName !== undefined) firstName.value = userData.firstName;
        if (userData.lastName !== undefined) lastName.value = userData.lastName;
        if (userData.username !== undefined) username.value = userData.username;
        if (userData.phone !== undefined) phone.value = userData.phone;
        if (userData.bio !== undefined) bio.value = userData.bio;

        // Фото
        if (userData.avatar !== undefined) avatar.value = userData.avatar;
        if (userData.photo !== undefined) photo.value = userData.photo;

        // Флаги
        if (userData.isBot !== undefined) isBot.value = userData.isBot;
        if (userData.isPremium !== undefined) isPremium.value = userData.isPremium;
        if (userData.isVerified !== undefined) isVerified.value = userData.isVerified;

        // Дополнительно
        if (userData.langCode !== undefined) langCode.value = userData.langCode;
        if (userData.status !== undefined) status.value = userData.status;

        // Для обратной совместимости - если передали fullName
        if (userData.fullName !== undefined) {
            const names = userData.fullName.split(' ');
            firstName.value = names[0] || '';
            lastName.value = names.slice(1).join(' ') || '';
        }
    }

    function updateUserFullName(name) {
        const names = name.split(' ');
        firstName.value = names[0] || '';
        lastName.value = names.slice(1).join(' ') || '';
    }

    function setAvatar(avatarUrl) {
        avatar.value = avatarUrl;
    }

    function clearUser() {
        id.value = null;
        firstName.value = '';
        lastName.value = '';
        username.value = '';
        phone.value = '';
        bio.value = '';
        avatar.value = '';
        photo.value = null;
        isBot.value = false;
        isPremium.value = false;
        isVerified.value = false;
        langCode.value = null;
        status.value = null;
    }

    // Getters (computed)
    const userId = computed(() => id.value);
    const userFirstName = computed(() => firstName.value);
    const userLastName = computed(() => lastName.value);
    const userName = computed(() => username.value);
    const userPhone = computed(() => phone.value);
    const userBio = computed(() => bio.value);
    const userAvatar = computed(() => avatar.value);
    const userPhoto = computed(() => photo.value);

    // Полное имя (комбинация firstName + lastName)
    const fullName = computed(() =>
        `${firstName.value} ${lastName.value}`.trim() || username.value || 'Неизвестный пользователь'
    );

    // Флаги
    const userIsBot = computed(() => isBot.value);
    const userIsPremium = computed(() => isPremium.value);
    const userIsVerified = computed(() => isVerified.value);
    const userLangCode = computed(() => langCode.value);
    const userStatus = computed(() => status.value);

    // Проверки
    const hasUser = computed(() => id.value !== null);
    const isOnline = computed(() => status.value?.type === 'online');
    const hasUsername = computed(() => username.value && username.value.length > 0);
    const hasPhone = computed(() => phone.value && phone.value.length > 0);
    const hasBio = computed(() => bio.value && bio.value.length > 0);

    // Форматированная дата последней активности
    const lastSeen = computed(() => {
        if (!status.value?.wasOnline) return null;
        return new Date(status.value.wasOnline);
    });

    return {
        // State
        id,
        firstName,
        lastName,
        username,
        phone,
        bio,
        avatar,
        photo,
        isBot,
        isPremium,
        isVerified,
        langCode,
        status,

        // Actions
        setUserData,
        updateUserFullName,
        setAvatar,
        clearUser,

        // Getters - основные
        userId,
        userFirstName,
        userLastName,
        userName,
        userPhone,
        userBio,
        userAvatar,
        userPhoto,
        fullName,

        // Getters - флаги
        userIsBot,
        userIsPremium,
        userIsVerified,
        userLangCode,
        userStatus,

        // Getters - проверки
        hasUser,
        isOnline,
        hasUsername,
        hasPhone,
        hasBio,
        lastSeen,
    };
});

export default useUserStore;
