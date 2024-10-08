import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const defaultStateModel = {
        id: 0,
        fullName: 'Name',
        avatar: '',
    };

    const state = ref(defaultStateModel);

    function setUserData(user) {
        this.state = user;
    }

    function updateUserFullName(name) {
        this.state.fullName = name;
    }

    function setAvatar(avatar) {
        this.state.avatar = avatar;
    }

    function $reset() {
        this.state = defaultStateModel;
    }

    return { state, $reset, setUserData, setAvatar, updateUserFullName };
});


export default useUserStore;
