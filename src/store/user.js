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

        // Социальные связи
        if (userData.isContact !== undefined) isContact.value = userData.isContact;
        if (userData.isMutualContact !== undefined)
            isMutualContact.value = userData.isMutualContact;
        if (userData.isCloseFriend !== undefined) isCloseFriend.value = userData.isCloseFriend;
        if (userData.isContactRequirePremium !== undefined)
            isContactRequirePremium.value = userData.isContactRequirePremium;

        // Истории
        if (userData.isStoriesHidden !== undefined)
            isStoriesHidden.value = userData.isStoriesHidden;
        if (userData.isStoriesUnavailable !== undefined)
            isStoriesUnavailable.value = userData.isStoriesUnavailable;
        if (userData.storiesMaxId !== undefined) storiesMaxId.value = userData.storiesMaxId;

        // Дополнительные юзернеймы
        if (userData.usernames !== undefined) {
            usernames.value = Array.isArray(userData.usernames) ? userData.usernames : [];
        }

        // Визуальная кастомизация
        if (userData.emojiStatus !== undefined) emojiStatus.value = userData.emojiStatus;
        if (userData.color !== undefined) color.value = userData.color;
        if (userData.profileColor !== undefined) profileColor.value = userData.profileColor;

        // Безопасность
        if (userData.isFake !== undefined) isFake.value = userData.isFake;
        if (userData.isScam !== undefined) isScam.value = userData.isScam;
        if (userData.isRestricted !== undefined) isRestricted.value = userData.isRestricted;
        if (userData.restrictionReason !== undefined)
            restrictionReason.value = userData.restrictionReason;
        if (userData.isDeleted !== undefined) isDeleted.value = userData.isDeleted;
        if (userData.isSupport !== undefined) isSupport.value = userData.isSupport;

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
