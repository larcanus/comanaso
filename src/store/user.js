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

    // State - социальные связи
    const isContact = ref(false);
    const isMutualContact = ref(false);
    const isCloseFriend = ref(false);
    const isContactRequirePremium = ref(false);

    // State - истории (Stories)
    const isStoriesHidden = ref(false);
    const isStoriesUnavailable = ref(true);
    const storiesMaxId = ref(null);

    // State - дополнительные юзернеймы
    const usernames = ref([]); // Массив дополнительных @никнеймов

    // State - визуальная кастомизация
    const emojiStatus = ref(null);
    const color = ref(null);
    const profileColor = ref(null);

    // State - безопасность и ограничения
    const isFake = ref(false);
    const isScam = ref(false);
    const isRestricted = ref(false);
    const restrictionReason = ref(null);
    const isDeleted = ref(false);
    const isSupport = ref(false);

    /**
     * Нормализует и валидирует данные пользователя
     * @param {Object} rawData - Сырые данные с бэкенда
     */
    function normalizeUserData(rawData) {
        if (!rawData || typeof rawData !== 'object') {
            console.warn('[UserStore] Invalid user data received:', rawData);
            return null;
        }

        return {
            // Основные данные
            id: rawData.id ?? null,
            firstName: rawData.firstName ?? '',
            lastName: rawData.lastName ?? '',
            username: rawData.username ?? '',
            phone: rawData.phone ?? '',
            bio: rawData.bio ?? '',
            avatar: rawData.url ?? rawData.avatar ?? '',
            photo: rawData.photo ?? null,

            // Флаги и статусы
            isBot: Boolean(rawData.isBot),
            isPremium: Boolean(rawData.isPremium),
            isVerified: Boolean(rawData.isVerified),
            langCode: rawData.langCode ?? null,
            status: rawData.status ?? null,

            // Социальные связи
            isContact: Boolean(rawData.isContact),
            isMutualContact: Boolean(rawData.isMutualContact),
            isCloseFriend: Boolean(rawData.isCloseFriend),
            isContactRequirePremium: Boolean(rawData.isContactRequirePremium),

            // Истории (Stories)
            isStoriesHidden: Boolean(rawData.isStoriesHidden),
            isStoriesUnavailable: rawData.isStoriesUnavailable !== false,
            storiesMaxId: rawData.storiesMaxId ?? null,

            // Дополнительные юзернеймы
            usernames: Array.isArray(rawData.usernames) ? rawData.usernames : [],

            // Визуальная кастомизация
            emojiStatus: rawData.emojiStatus ?? null,
            color: rawData.color ?? null,
            profileColor: rawData.profileColor ?? null,

            // Безопасность и ограничения
            isFake: Boolean(rawData.isFake),
            isScam: Boolean(rawData.isScam),
            isRestricted: Boolean(rawData.isRestricted),
            restrictionReason: rawData.restrictionReason ?? null,
            isDeleted: Boolean(rawData.isDeleted),
            isSupport: Boolean(rawData.isSupport),
        };
    }

    /**
     * Устанавливает данные пользователя
     * @param {Object} userData - Данные пользователя (сырые или нормализованные)
     */
    function setUserData(userData) {
        // Нормализуем данные
        const normalized = normalizeUserData(userData);

        if (!normalized) {
            console.error('[UserStore] Failed to normalize user data');
            return;
        }

        // Устанавливаем основные данные
        id.value = normalized.id;
        firstName.value = normalized.firstName;
        lastName.value = normalized.lastName;
        username.value = normalized.username;
        phone.value = normalized.phone;
        bio.value = normalized.bio;
        avatar.value = normalized.avatar;
        photo.value = normalized.photo;

        // Флаги и статусы
        isBot.value = normalized.isBot;
        isPremium.value = normalized.isPremium;
        isVerified.value = normalized.isVerified;
        langCode.value = normalized.langCode;
        status.value = normalized.status;

        // Социальные связи
        isContact.value = normalized.isContact;
        isMutualContact.value = normalized.isMutualContact;
        isCloseFriend.value = normalized.isCloseFriend;
        isContactRequirePremium.value = normalized.isContactRequirePremium;

        // Истории
        isStoriesHidden.value = normalized.isStoriesHidden;
        isStoriesUnavailable.value = normalized.isStoriesUnavailable;
        storiesMaxId.value = normalized.storiesMaxId;

        // Дополнительные юзернеймы
        usernames.value = normalized.usernames;

        // Визуальная кастомизация
        emojiStatus.value = normalized.emojiStatus;
        color.value = normalized.color;
        profileColor.value = normalized.profileColor;

        // Безопасность
        isFake.value = normalized.isFake;
        isScam.value = normalized.isScam;
        isRestricted.value = normalized.isRestricted;
        restrictionReason.value = normalized.restrictionReason;
        isDeleted.value = normalized.isDeleted;
        isSupport.value = normalized.isSupport;
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

        // Социальные связи
        isContact.value = false;
        isMutualContact.value = false;
        isCloseFriend.value = false;
        isContactRequirePremium.value = false;

        // Истории
        isStoriesHidden.value = false;
        isStoriesUnavailable.value = true;
        storiesMaxId.value = null;

        // Дополнительные юзернеймы
        usernames.value = [];

        // Визуальная кастомизация
        emojiStatus.value = null;
        color.value = null;
        profileColor.value = null;

        // Безопасность
        isFake.value = false;
        isScam.value = false;
        isRestricted.value = false;
        restrictionReason.value = null;
        isDeleted.value = false;
        isSupport.value = false;
    }

    // Getters (computed) - основные
    const userId = computed(() => id.value);
    const userFirstName = computed(() => firstName.value);
    const userLastName = computed(() => lastName.value);
    const userName = computed(() => username.value);
    const userPhone = computed(() => phone.value);
    const userBio = computed(() => bio.value);
    const userAvatar = computed(() => avatar.value);
    const userPhoto = computed(() => photo.value);

    // Полное имя (комбинация firstName + lastName)
    const fullName = computed(
        () =>
            `${firstName.value} ${lastName.value}`.trim() ||
            username.value ||
            'Неизвестный пользователь'
    );

    // Getters - флаги
    const userIsBot = computed(() => isBot.value);
    const userIsPremium = computed(() => isPremium.value);
    const userIsVerified = computed(() => isVerified.value);
    const userLangCode = computed(() => langCode.value);
    const userStatus = computed(() => status.value);

    // Getters - социальные связи
    const userIsContact = computed(() => isContact.value);
    const userIsMutualContact = computed(() => isMutualContact.value);
    const userIsCloseFriend = computed(() => isCloseFriend.value);
    const userIsContactRequirePremium = computed(() => isContactRequirePremium.value);

    // Getters - истории
    const userIsStoriesHidden = computed(() => isStoriesHidden.value);
    const userIsStoriesUnavailable = computed(() => isStoriesUnavailable.value);
    const userStoriesMaxId = computed(() => storiesMaxId.value);

    // Getters - дополнительные юзернеймы
    const userUsernames = computed(() => usernames.value);
    const hasMultipleUsernames = computed(() => usernames.value.length > 0);

    // Getters - визуальная кастомизация
    const userEmojiStatus = computed(() => emojiStatus.value);
    const userColor = computed(() => color.value);
    const userProfileColor = computed(() => profileColor.value);
    const hasEmojiStatus = computed(() => emojiStatus.value !== null);
    const hasCustomColors = computed(() => color.value !== null || profileColor.value !== null);

    // Getters - безопасность
    const userIsFake = computed(() => isFake.value);
    const userIsScam = computed(() => isScam.value);
    const userIsRestricted = computed(() => isRestricted.value);
    const userRestrictionReason = computed(() => restrictionReason.value);
    const userIsDeleted = computed(() => isDeleted.value);
    const userIsSupport = computed(() => isSupport.value);

    // Getters - проверки
    const hasUser = computed(() => id.value !== null);
    const isOnline = computed(() => status.value?.type === 'online');
    const hasUsername = computed(() => username.value && username.value.length > 0);
    const hasPhone = computed(() => phone.value && phone.value.length > 0);
    const hasBio = computed(() => bio.value && bio.value.length > 0);
    const hasStories = computed(() => !isStoriesUnavailable.value && storiesMaxId.value !== null);

    // Форматированная дата последней активности
    const lastSeen = computed(() => {
        if (!status.value?.wasOnline) return null;
        return new Date(status.value.wasOnline);
    });

    // Дата-центр из фото
    const photoDcId = computed(() => photo.value?.dcId || null);

    return {
        // State - основные
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

        // State - социальные связи
        isContact,
        isMutualContact,
        isCloseFriend,
        isContactRequirePremium,

        // State - истории
        isStoriesHidden,
        isStoriesUnavailable,
        storiesMaxId,

        // State - дополнительные юзернеймы
        usernames,

        // State - визуальная кастомизация
        emojiStatus,
        color,
        profileColor,

        // State - безопасность
        isFake,
        isScam,
        isRestricted,
        restrictionReason,
        isDeleted,
        isSupport,

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

        // Getters - социальные связи
        userIsContact,
        userIsMutualContact,
        userIsCloseFriend,
        userIsContactRequirePremium,

        // Getters - истории
        userIsStoriesHidden,
        userIsStoriesUnavailable,
        userStoriesMaxId,

        // Getters - дополнительные юзернеймы
        userUsernames,
        hasMultipleUsernames,

        // Getters - визуальная кастомизация
        userEmojiStatus,
        userColor,
        userProfileColor,
        hasEmojiStatus,
        hasCustomColors,

        // Getters - безопасность
        userIsFake,
        userIsScam,
        userIsRestricted,
        userRestrictionReason,
        userIsDeleted,
        userIsSupport,

        // Getters - проверки
        hasUser,
        isOnline,
        hasUsername,
        hasPhone,
        hasBio,
        hasStories,
        lastSeen,
        photoDcId,
    };
});

export default useUserStore;
