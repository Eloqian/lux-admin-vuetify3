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
    animationLink="https://assets9.lottiefiles.com/datafiles/67bae0ddb57b26679d10e9ce7c1d445f/data.json"
    :height="props.size"
    :width="props.size"
  />
</template>

<style scoped lang="scss"></style>
