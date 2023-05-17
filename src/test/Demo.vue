<!--
* @Component:
* @Maintainer: Eloqian
* @Description:
-->
<script setup lang="ts">
defineProps({
  name: {
    type: String,
    default: "Eloqian",
  },
});
</script>

<template>
  <div class="">
    {{ name }}
  </div>
</template>

<style scoped lang="scss"></style>
