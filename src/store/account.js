import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAccountStore = defineStore('account', () => {
    const defaultStateModel = {
        id: 0,
        name: '',
        entity: '',
        apiId: 0,
        apiHash: '',
        phoneNumber: '',
    };

    const state = ref({});

    function setAccountData(accountData) {
        this.state[accountData.id] = validate({
            ...defaultStateModel,
            ...accountData,
        });
    }

    function $reset() {
        this.state = {};
    }

    function validate(fields) {
        if (fields.name === null || fields.name.length === 0) {
            fields.name = `${generatePositiveAccountName()} telegram`;
        }

        return fields;
    }

    return { state, $reset, setAccountData };
});

function generatePositiveAccountName() {
    const adjectives = [
        'Замечательный',
        'Удивительный',
        'Великолепный',
        'Прекрасный',
        'Фантастический',
        'Восхитительный',
        'Чудесный',
        'Потрясающий',
        'Блестящий',
        'Исключительный',
    ];

    const noun = 'аккаунт';

    const randomAdjective =
        adjectives[Math.floor(Math.random() * adjectives.length)];

    return `${randomAdjective} ${noun}`;
}

export default useAccountStore;
