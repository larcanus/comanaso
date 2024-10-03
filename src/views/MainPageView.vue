<script setup>

import {useRouter} from "vue-router";
import {ref} from "vue";

const router = useRouter();

  const sections = ['account', 'analytics', 'settings'];
const state = ref({
  selectedSection: 'account',
})

const selectSection = (section) => {
  console.log(section)
  state.value.selectedSection = section;
  router.push({path: `/main/${section}`});
};

</script>

<template>
  <div class="container">
    <aside class="sidebar">
      <div class="user-info">
        <img src="@/assets/empty-avatar.png" alt="User Avatar" class="avatar"/>
        <h2 class="user-name">Иван Иванов</h2>
      </div>
      <nav class="navigation">
        <!--        <ul>-->
        <!--          <li @click="selectSection('account')">Аккаунты</li>-->
        <!--          <li @click="selectSection('analytics')">Доступные данные</li>-->
        <!--          <li @click="selectSection('settings')">Настройки</li>-->
        <!--        </ul>-->
        <button
            v-for="section in sections"
            :key="section"
            @click="selectSection(section)"
            :class="{ active: state.selectedSection === section }"
            class="nav-button"
        >
          {{ section }}
        </button>
      </nav>
    </aside>

    <main class="content">
      <router-view/>
    </main>

    <footer class="footer">
      <p>Справочная информация</p>
    </footer>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  flex-direction: column;
}

.sidebar {
  width: 25%;
  background-color: #f4f4f4;
  padding: 20px;
  box-sizing: border-box;
  position: fixed;
  height: 100%;
  overflow-y: auto;
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
  font-size: 18px;
  color: #252272;
}

.content {
  margin-left: 25%;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  flex-grow: 1;
}

.footer {
  background-color: #1c1c1c;
  color: #fff;
  padding: 10px;
  text-align: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
}

.navigation {
  display: flex;
  flex-direction: column;
}

.nav-button {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  position: relative;
}

.nav-button:hover {
  transform: scale(1.05);
}

.nav-button.active {
  background-color: #007bff;
  color: #fff;
}

.nav-button.active::after {
  content: '';
  position: absolute;
  right: -15px; /* Смещение стрелки за пределы кнопки */
  top: 0;
  height: 100%;
  width: 0;
  border-left: 15px solid #007bff; /* Цвет стрелки */
  border-top: 16px solid transparent;
  border-bottom: 16px solid transparent;
}
</style>
