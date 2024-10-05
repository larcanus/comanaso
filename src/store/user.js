import { defineStore } from 'pinia'
import {ref} from "vue";

export const useUserStore = defineStore('user', () => {
	const state = ref({
		id: 0,
		fullName: 'Name',
		avatar: '',
	});

	function setUserData(user) {
		this.state = user;
	}

	function updateUserFullName(name) {
		this.state.fullName = name;
	}

	function setAvatar(avatar) {
		this.state.avatar = avatar;
	}

	return { state, setUserData, setAvatar, updateUserFullName };
})
