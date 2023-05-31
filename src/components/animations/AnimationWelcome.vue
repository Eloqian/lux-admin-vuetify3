<!--
* @Component:
* @Maintainer: Eloqian
* @Description:
-->
<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
const props = defineProps({
  size: {
    type: Number,
  },
});
</script>

<template>
  <Vue3Lottie
    animationLink="https://assets3.lottiefiles.com/private_files/lf30_ps1145pz.json"
    :height="props.size"
    :width="props.size"
  />
</template>

<style scoped lang="scss"></style>
