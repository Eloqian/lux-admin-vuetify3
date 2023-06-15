<template>
  <div class="d-flex text-center flex-grow-1">
    <v-sheet
      class="layout-side d-none d-md-flex flex-column justify-space-between"
    >
      <div class="mt-3 mt-md-10 pa-2">
        <div class="text-primary text-h4 font-weight-bold">
          EloRank
        </div>
        <div class="title my-2">
          Welcome! Let's elo amazing things together.
        </div>
      </div>
    </v-sheet>
    <v-card
      variant="outlined"
      class="flex-grow-1 d-flex align-center justify-center flex-column"
    >
      <div class="layout-content ma-auto w-full">
        <slot></slot>
      </div>
      <div class="pa-5"><a href="https://www.scut.edu.cn/new/">SCUT</a> | <a href="https://codeforces.com/profile/Elo">Powered by Elo</a>
      <footer class="footer">
    <p>
      © 2023
      <span id="site-name">EloRank</span>&nbsp;&middot;&nbsp;
      <span id="date">{{ currentDate }}</span>&nbsp;&middot;&nbsp;
      <span id="load-time">{{ loadTime }}ms</span>&nbsp;&middot;&nbsp;
      <span id="time-zone">{{ timeZone }}</span>
    </p>
  </footer>
    </div>
    </v-card>
  </div>
</template>


<style lang="scss" scoped>
.layout-side {
  width: 420px;
}

.layout-content {
  max-width: 480px;
}
.text-underline:hover {
  text-decoration: underline;
}

.footer {
  margin-top: 20px;
  text-align: center;
}

.footer p {
  font-size: 14px;
  color: #999;
}

.footer span {
  color: #666;
}

.footer span#site-name {
  font-weight: bold;
}

.footer span#load-time {
  font-family: monospace;
}
</style>
<script setup lang="ts">

    // 获取当前日期和时间
    const date = new Date();
    const year = date.getFullYear(); // 获取当前年份
    const month = date.getMonth() + 1; // 获取当前月份
    const day = date.getDate(); // 获取当前日期
    let timeZone = date.toLocaleTimeString('en-us', { timeZoneName: 'short' }).split(' ')[2]; // 获取时区

    // 呈现日期和时间
    const currentDate = `${year}-${month}-${day}`;
    const loadTime = (performance.now()).toFixed(3);
    timeZone = `${timeZone}`;

</script>
