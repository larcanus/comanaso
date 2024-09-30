<script setup>
import { ref } from 'vue'
import SecurityInfoSlot from './elements/SecurityInfoSlot.vue'
import SecurityIcon from '@/components/sections/elements/SecurityIcon.vue'

const infoItems = ref([
  { icon: 'src/assets/animated-protection.gif', text: 'Мы не собираем ваши личные данные.' },
  { icon: 'src/assets/animated-analytic-time.gif', text: 'Анализ данных происходит только во время работы сайта.' },
  { icon: 'src/assets/animated-db-save.gif', text: 'Мы не храним ваши данные на наших серверах.' },
  { icon: 'src/assets/animated-fences.gif', text: 'Ваши данные защищены современными методами шифрования.' },
])
</script>

<template>
  <section class="section third">
    <div>
      <h2>Конфиденциальность и безопасность данных</h2>
      <div class="info-grid">
        <div class="info-row" v-for="(item, index) in infoItems" :key="index">
          <SecurityInfoSlot>
            <template #icon>
              <SecurityIcon :path-icon="item.icon"/>
            </template>
            <template #info>
              {{ item.text }}
            </template>
          </SecurityInfoSlot>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.third {
  padding: 20px 20px 35px 20px;
  background-color: #030303;
  text-align: center;
}

.third h2 {
  font-size: 34px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: flex-start;
  margin: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin: 15px;
}

@media (max-width: 900px) {
  .third h2{
    font-size: 23px;
  }

  .info-grid {
    margin: 15px;
  }
  .info-row {
    margin: 10px;
  }
}

@media (max-width: 600px) {
  .info-grid {
    margin: 10px;
  }
  .info-row {
    margin: 5px;
  }
}

@media (max-width: 500px) {
  .info-grid {
    margin: 0;
  }
  .info-row {
    margin: 15px 0 0 0;
  }
}

</style>
