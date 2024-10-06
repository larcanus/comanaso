import { defineStore } from 'pinia'
import {ref} from 'vue';

export const useAuthStore = defineStore('auth', () => {
	const defaultStateModel = {
		userId: 0,
		token: '',
		isAuthenticated: false,
	}

	const state = ref(defaultStateModel);

	function setAuthData(newState)
	{
		this.state = newState;
	}

	function $reset()
	{
		this.state = defaultStateModel;
	}

	return { state, $reset, setAuthData }
});
