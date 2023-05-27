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
    default: 500,
  },
});
</script>

<template>
  <Vue3Lottie
    animationLink="https://assets8.lottiefiles.com/packages/lf20_l9crap4a.json"
    :height="props.size"
    :width="props.size"
  />
</template>

<style scoped lang="scss"></style>
