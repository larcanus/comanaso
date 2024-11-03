<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import FooterSection from '@/components/front-page-section/FooterSection.vue';
import { useUserStore } from '@/store/user';
import LogOut from '@/components/button/LogOut.vue';
import Toast from '@/components/toast/Toast.vue';

const store = useUserStore();
const router = useRouter();

const sections = [
    { path: 'account', name: 'АККАУНТЫ' },
    { path: 'analytics', name: 'АНАЛИТИКА' },
    { path: 'settings', name: 'НАСТРОЙКИ' },
];
const state = ref({
    selectedSection: 'account',
    showSidebar: false,
});

const selectSection = (section) => {
    state.value.selectedSection = section;
    router.push({ path: `/main/${section}` });
};

function onMenuClick() {
    state.value.showSidebar = !state.value.showSidebar;
}
</script>

<template>
    <div class="container">
        <Transition name="menu" mode="out-in">
            <div
                class="menu-div"
                v-if="!state.showSidebar"
                @click="onMenuClick"
            >
                <img src="@/assets/menu.png" alt="menu" />
            </div>
        </Transition>
        <aside class="sidebar" :class="{ sidebarShow: state.showSidebar }">
            <div
                class="menu-cancel-div"
                @click="state.showSidebar = !state.showSidebar"
            >
                <img src="@/assets/cancel-sq.png" alt="cancel-menu" />
            </div>
            <div class="user-info">
                <img
                    src="@/assets/empty-avatar.png"
                    alt="User Avatar"
                    class="avatar"
                />
                <h2 class="user-name">{{ store.state.fullName }}</h2>
            </div>
            <nav class="navigation">
                <button
                    v-for="section in sections"
                    :key="section"
                    @click="selectSection(section.path)"
                    :class="{ active: state.selectedSection === section.path }"
                    class="nav-button"
                >
                    {{ section.name }}
                </button>
            </nav>
            <div class="logout-button">
                <LogOut />
            </div>
        </aside>

        <div class="content">
            <router-view />
            <FooterSection />
        </div>
    </div>
    <Toast />
</template>

<style scoped>
.container {
    overflow-x: hidden;
}

.sidebar {
    width: 25%;
    background: linear-gradient(
            rgba(135, 60, 255, 0.4),
            rgba(135, 60, 255, 0) 80%
        ),
        linear-gradient(
            -45deg,
            rgba(120, 155, 255, 0.9) 25%,
            rgba(255, 160, 65, 0.9) 75%
        );
    background-color: #412e85;
    padding: 20px 24px 20px 20px;
    box-sizing: border-box;
    position: fixed;
    z-index: 2;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

.logout-button {
    margin-top: auto;
}

.user-info {
    text-align: center;
    margin-bottom: 20px;
}

.avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

.user-name {
    margin-top: 10px;
    font-size: 19px;
    color: #1e1c52;
}

.content {
    margin-left: 25%;
    display: flex;
    align-items: center;
    flex-direction: column;
    flex-grow: 1;
    width: 75%;
    min-height: 100vh;
    background: rgb(51, 16, 84);
    background: linear-gradient(
        90deg,
        rgba(51, 16, 84, 1) 0%,
        rgba(25, 9, 73, 1) 9%,
        rgba(2, 2, 64, 1) 17%,
        rgba(3, 3, 48, 1) 27%,
        rgba(3, 3, 34, 1) 36%,
        rgba(3, 3, 34, 1) 62%,
        rgba(2, 2, 48, 1) 72%,
        rgba(1, 1, 63, 1) 83%,
        rgba(23, 8, 70, 1) 91%,
        rgba(48, 15, 78, 1) 100%
    );
}

.navigation {
    display: flex;
    flex-direction: column;
}

.nav-button {
    width: 100%;
    padding: 10px;
    margin: 10px 10px 10px 0;
    border: 1px;
    border-radius: 1px;
    text-align: center;
    cursor: pointer;
    transition:
        transform 0.2s,
        background-color 0.2s;
    position: relative;
    background-color: #3d33a2;
    color: #fff;
}

.nav-button:hover {
    transform: scale(1.05);
}

.nav-button.active {
    background-color: #221b5e;
    color: #fff;
}

.menu-div {
    display: flex;
    position: absolute;
    margin: 25px 25px 25px 25px;
    flex-direction: row;
    align-items: flex-end;
    align-content: center;
    justify-content: flex-end;
    opacity: 0.8;
}

.menu-cancel-div {
    display: none;
    margin: 0 0 50px 0;
    flex-direction: row;
    align-items: flex-end;
    align-content: center;
    justify-content: flex-end;
}

.menu-div img {
    width: 45px;
    height: 45px;
}

.menu-enter-active {
    transition: all 0.3s ease-out;
}
.menu-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.menu-enter-from,
.menu-leave-to {
    transform: rotate(0.3turn);
    opacity: 0;
}

.menu-cancel-div img {
    width: 35px;
    height: 35px;
}

@media (max-width: 750px) {
    .sidebar {
        visibility: hidden;
        opacity: 0;
        transform: translateX(-20%);
        width: 50%;
    }
    .sidebarShow {
        visibility: visible;
        opacity: 1;
        transform: translateX(0);
        transition:
            opacity 0.4s ease-in-out,
            transform 0.4s ease-in-out;
    }

    .menu-cancel-div {
        display: flex;
    }

    .content {
        margin: 0;
        width: 100%;
    }
}

@media (min-width: 800px) {
    .menu-div {
        display: none;
    }
}
</style>
