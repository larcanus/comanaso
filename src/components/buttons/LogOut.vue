<script setup>
import {useUserStore} from '@/store/user'
import {useRouter} from "vue-router";

const store = useUserStore();
const router = useRouter();

function onClickContainer() {
  store.$reset();
  router.replace({path:'/'})
}

</script>

<template>
  <div class="container" @click="onClickContainer">
    <img src="@/assets/log-out.png" alt="logout" class="button-img"/>
  </div>
</template>

<style scoped>
.container
{
  margin: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.button-img
{
  width: 70px;
  height: 70px;
}
.container:hover {
  opacity: 0.9;
  transform: scale(1.1);
  transition: transform 0.3s;
}
</style>
