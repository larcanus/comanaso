<script setup>

</script>

<template>
  <section class="section first">
    <h3>Проанализируй свое время</h3>
    <h1>
      На нашем сайте вы можете проводить анализ данных ваших аккаунтов.
    </h1>
    <h1>
      Мы предлагаем инструменты для:
    </h1>
    <div class="card">
      <div class="tools">
        <img class="icon" src="@/assets/clock-icon.svg" alt="dots icon">
        <p>Анализа затраченного времени</p>
      </div>
      <div class="tools">
        <img class="icon" src="@/assets/list-icon.svg" alt="dots icon">
        <p>Отслеживания ключевых метрик</p>
      </div>
      <div class="tools">
        <img class="icon" src="@/assets/layers-icon.svg" alt="dots icon">
        <p>Создания наглядных отчетов</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  width: 100vw;
  height: 100%;
  display: flex;
  color: #e0e0e0;
  flex-direction: column;
  background-color: #070303;
  margin: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.section h3 {
  text-align: left;
  font-size: 65px;
  align-self: flex-start;
  margin: 5% 0 0 5%;
  font-weight: bold;
}

.section h1 {
  text-align: left;
  font-size: 30px;
  align-self: flex-start;
  margin: 1% 0 0 5%;
  font-weight: 500;
}

.card {
  width: 35vw;
  margin: 10px 10px 10px 10px;
  padding: 10px;
  align-items: center;
  justify-items: center;
}

.tools {
  margin: 35px 0 35px 0;
  text-align: center;
  font-size: 18px;
}

@media (max-width: 600px) {
  .section h3 {
    font-size: 35px;
    margin: 16% 0 0 5%;
  }
  .section h1 {
    font-size: 25px;
    margin: 10% 0 0 5%;
  }
  .card {
    width: 65vw;
  }
}

@media (max-width: 440px) {
  .section h3 {
    font-size: 23px;
    margin: 23% 0 0 5%;
  }
  .section h1 {
    font-size: 18px;
    margin: 10% 0 0 5%;
  }
  .card {
    width: 85vw;
  }
}

.first {
  background-color: #0a0000; /* Цвет фона */
  background-repeat: no-repeat;
  background-position: bottom left 35%;
  background-size: cover; /* Оставляем изображение в его естественном размере */
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-image: url('@/assets/2.png')
}
</style>
