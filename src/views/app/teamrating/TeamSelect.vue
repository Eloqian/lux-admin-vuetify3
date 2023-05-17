<template>
  <div class="team-select">
    <div class="select-area">
      <v-row align="center" justify="center">
        <v-col cols="12" md="11">
          <v-card class="mb-5" height="400px">
            <v-card-title class="bg-white py-4 font-weight-bold">
              Choose Team Members
            </v-card-title>
            <v-col cols="12" sm="6">
              <transition-group
                name="avatar"
                tag="div"
                class="select-area"
                mode="out-in"
              >
                <a-avatar
                  :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }"
                  v-if="selectedTeam[0]"
                  :key="selectedTeam[0].id"
                  :src="selectedTeam[0].avatar"
                  @click="removeFromSelected(0)"
                ></a-avatar>
                <a-avatar
                  :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }"
                  v-if="selectedTeam[1]"
                  :key="selectedTeam[1].id"
                  :src="selectedTeam[1].avatar"
                  @click="removeFromSelected(1)"
                />
                <a-avatar
                  :size="{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }"
                  v-if="selectedTeam[2]"
                  :key="selectedTeam[2].id"
                  :src="selectedTeam[2].avatar"
                  @click="removeFromSelected(2)"
                />
              </transition-group>
            </v-col>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <v-row align="center" justify="center">
      <v-col cols="12" md="11">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" lg="4" md="6">
                <v-text-field
                  density="compact"
                  v-model="search"
                  label="Search Name"
                  hide-details
                  variant="outlined"
                  color="primary"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-col cols="12" md="12" class="center">
      <v-container>
        <v-item-group mandatory selected-class="active-card">
          <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4" lg="2" v-for="item in teamList">
              <v-item v-slot="{ isSelected, selectedClass }">
                <v-card
                  :theme="isSelected ? 'dark' : 'light'"
                  max-width="280"
                  class="base-card text-center mx-auto pa-10 pa-md-15 d-flex flex-column justify-center"
                  :class="selectedClass"
                  @click="addToSelected(item)"
                >
                  <v-avatar class="mx-auto" size="100">
                    <v-img :src="item.avatar" alt="alt" />
                  </v-avatar>
                  <h6 class="text-h6">{{ item.name }}</h6>
                  <p class="text-body-1 text-blue-grey">
                    {{ item.name }}
                  </p>
                  <p class="text-body-2 text-grey">{{ item.id }}</p>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-item-group>
      </v-container>
    </v-col>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";

interface TeamMember {
  id: number;
  name: string;
  avatar: string;
}
const search = ref("");
const props = defineProps({
  teamList: {
    type: Array as () => TeamMember[],
    required: true,
  },
  maxSelect: {
    type: Number,
    default: 5,
  },
  selectedTeam: {
    type: Array as () => TeamMember[],
    default: () => [],
  },
});

const emit = defineEmits(["update:selectedTeam"]);

const addToSelected = (item: TeamMember) => {
  if (props.selectedTeam.length < props.maxSelect) {
    emit("update:selectedTeam", [...props.selectedTeam, item]);
  } else {
    // message.error("已达到最大选择数量");
  }
};

const removeFromSelected = (index: number) => {
  emit(
    "update:selectedTeam",
    props.selectedTeam.filter((_, i) => i !== index)
  );
};
</script>

<style scoped lang="less">
.avatar-enter-active,
.avatar-leave-active {
  transition: all 0.5s;
}

.avatar-enter-from,
.avatar-leave-to {
  transform: scale(0);
  opacity: 0;
}

.avatar-move {
  transition: transform 0.5s;
}

.base-card {
  transition: 0.3s ease-out;
}

.active-card {
  border: 1px solid #e5e5e5;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
  transition: 0.3s ease-out;
}

</style>
