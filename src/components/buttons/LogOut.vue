<script setup>
import {useUserStore} from '@/store/user'
import {useAuthStore} from '@/store/auth'
import {useRouter} from "vue-router";

const storeUser = useUserStore();
const storeAuth = useAuthStore();
const router = useRouter();

function onClickContainer() {
  storeUser.$reset();
  storeAuth.$reset();
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
