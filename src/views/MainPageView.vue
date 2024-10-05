<script setup>

import {useRouter} from "vue-router";
import {ref} from "vue";
import FooterSection from "@/components/sections/FooterSection.vue";

const router = useRouter();

const sections = [
  {path: 'account', name: 'АККАУНТЫ'},
  {path: 'analytics', name: 'АНАЛИТИКА'},
  {path: 'settings', name: 'НАСТРОЙКИ'}];
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
    </aside>

    <div class="content">
      <router-view/>
      <FooterSection />
    </div>
  </div>
</template>

<style scoped>
.container {
  overflow-x: hidden;
 }

.sidebar {
  width: 25%;
  background: linear-gradient(rgba(135, 60, 255, 0.4), rgba(135, 60, 255, 0.0) 80%),
  linear-gradient(-45deg, rgba(120, 155, 255, 0.9) 25%, rgba(255, 160, 65, 0.9) 75%);
  padding: 20px 24px 20px 20px;
  box-sizing: border-box;
  position: fixed;
  align-self: flex-start;
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
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
  background: rgb(51,16,84);
  background: linear-gradient(90deg, rgba(51,16,84,1) 0%, rgba(25,9,73,1) 9%, rgba(2,2,64,1) 17%, rgba(3,3,48,1) 27%, rgba(3,3,34,1) 36%, rgba(3,3,34,1) 62%, rgba(2,2,48,1) 72%, rgba(1,1,63,1) 83%, rgba(23,8,70,1) 91%, rgba(48,15,78,1) 100%);
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
  transition: transform 0.2s, background-color 0.2s;
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
</style>
