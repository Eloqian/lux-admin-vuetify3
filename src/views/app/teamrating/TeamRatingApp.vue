<template>
  <div class="app">
      <team-select
        :team-list="teamList"
        :max-select="3"
        v-model:selected-team="selectedTeam"
      />
  </div>
</template>

<script lang="ts" setup>
import TeamSelect from "./TeamSelect.vue";

const teamList = [
  { id: 1, name: "张三", avatar: "https://picsum.photos/id/1/200/200" },
  { id: 2, name: "李四", avatar: "https://picsum.photos/id/2/200/200" },
  { id: 3, name: "王五", avatar: "https://picsum.photos/id/3/200/200" },
  { id: 4, name: "赵六", avatar: "https://picsum.photos/id/4/200/200" },
  { id: 5, name: "田七", avatar: "https://picsum.photos/id/5/200/200" },
  { id: 6, name: "周八", avatar: "https://picsum.photos/id/6/200/200" },
  { id: 7, name: "吴九", avatar: "https://picsum.photos/id/7/200/200" },
  { id: 8, name: "郑十", avatar: "https://picsum.photos/id/8/200/200" },
  { id: 9, name: "孙十一", avatar: "https://picsum.photos/id/9/200/200" },
  { id: 10, name: "钱十二", avatar: "https://picsum.photos/id/10/200/200" },
];

const selectedTeam = ref<TeamMember[]>([]);
</script>
