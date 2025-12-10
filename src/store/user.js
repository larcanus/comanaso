import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    // State
    const id = ref(null);
    const fullName = ref('');
    const avatar = ref('');

    // Actions
    function setUserData(userData) {
        if (userData.id !== undefined) id.value = userData.id;
        if (userData.fullName !== undefined) fullName.value = userData.fullName;
        if (userData.avatar !== undefined) avatar.value = userData.avatar;
    }

    function updateUserFullName(name) {
        fullName.value = name;
    }

    function setAvatar(avatarUrl) {
        avatar.value = avatarUrl;
    }

    function clearUser() {
        id.value = null;
        fullName.value = '';
        avatar.value = '';
    }

    // Getters (computed)
    const userId = computed(() => id.value);
    const userName = computed(() => fullName.value);
    const userAvatar = computed(() => avatar.value);
    const hasUser = computed(() => id.value !== null);

    return {
        // State
        id,
        fullName,
        avatar,

        // Actions
        setUserData,
        updateUserFullName,
        setAvatar,
        clearUser,

        // Getters
        userId,
        userName,
        userAvatar,
        hasUser,
    };
});

export default useUserStore;
