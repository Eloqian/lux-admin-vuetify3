<!--
* @Component:
* @Maintainer: J.K. Yang
* @Description:
-->
<script setup lang="ts">
import { getUserList, getUserPointList } from "@/api/userApi";
import CopyLabel from "@/components/common/CopyLabel.vue";
import dayjs, { Dayjs } from 'dayjs';
import { LazyResult } from "postcss";
import { ref } from 'vue';
type RangeValue = [Dayjs, Dayjs];

const loading = ref(true);
const totalRows = ref(0);

const queryOptions = reactive({
  name__contains: "",
  page: 1,
  page_size: 100,
});

const getlastyear = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString();
};

const queryData = {
  handles: ["Elo"],
  date_from: "",
  date_to: "",
};

const headers = [
  { title: "Rank", key: "rank" , width: '120px'},
  { title: "UserInfo", key: "codeforces_id" },
  { title: "Rating", key: "rating" ,sortable: true},
  { title: "Points", key: "points" ,sortable: true},
  { title: "Actions", key: "actions" },
];

const usersList = ref([]);
const pointsList = ref({});
const allusers = ref([]);
let date_from = getlastyear();
let date_to = new Date().toISOString();
console.log("date_from = ", date_from);
console.log("date_to = ", date_to);

const value = ref<[Dayjs, Dayjs]>([
  dayjs(date_from),
  dayjs(date_to),
]);

const check = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b) && queryData.date_from === date_from && queryData.date_to === date_to;
};

const getPoints = async () => {
  if (check(queryData.handles, allusers.value)) {
    return;
  } else {
    queryData.handles = allusers.value;
    queryData.date_from = date_from;
    queryData.date_to = date_to;
  }
  const pointResponse = await getUserPointList(queryData);
  pointsList.value = pointResponse.data;
  usersList.value.forEach((user: any) => {
    user.points = pointsList.value[user.codeforces_id];
  });
};

const getUsers = async () => {
  loading.value = true;
  const params = queryOptions;
  const usersResponse = await getUserList(params);

  allusers.value = usersResponse.data.results.map(
    (user: { codeforces_id: any }) => {
      return user.codeforces_id;
    }
  );
  getPoints();
  usersList.value = usersResponse.data.results.map(
    (user: {
      codeforces_id: any;
      avatar: string;
      username: any;
      name: any;
      position: any;
      email: any;
    }) => {
      return {
        avatar: user.avatar,
        codeforces_id: user.codeforces_id,
        username: user.username,
        name: user.name,
        location: user.position,
        email: user.email,
        points: pointsList.value[user.codeforces_id],
      };
    }
  );
  totalRows.value = usersResponse.data.count;

  loading.value = false;
};

onMounted(async () => {
  await getUsers();
});

const onUpdateOptions = async (options: {
  itemsPerPage: number;
  page: number;
  sortBy: any;
}) => {
  // if (!queryOptions.name__contains) return;
  queryOptions.page_size = options.itemsPerPage;
  queryOptions.page = options.page;
  await getUsers();
  if(options.sortBy.length == 0) return;
  const sortBy = options.sortBy[0].key;
  const sortDesc = options.sortBy[0].order;
  if (sortBy) {
    usersList.value.sort((a: any, b: any) => {
      return sortDesc==='asc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
    });
  }
};

const onRangeChange = async (dates: RangeValue, dateStrings: string[]) => {
  if (dates) {
    date_from = dates[0].toISOString();
    date_to = dates[1].toISOString();
    console.log("date_from = ", date_from);
    console.log("date_to = ", date_to);
  }
  await getUsers();
};

const rangePresets = ref([
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
  { label: 'Last 180 Days', value: [dayjs().add(-180, 'd'), dayjs()] },
  { label: 'Last 365 Days', value: [dayjs().add(-365, 'd'), dayjs()] },
  { label: 'Last 2 Years', value: [dayjs().add(-2, 'y'), dayjs()] },
  { label: 'Last 5 Years', value: [dayjs().add(-5, 'y'), dayjs()]},
]);
const size = ref<any>('large');
</script>
<template>
  <v-container>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="4" md="6">
            <v-text-field
              density="compact"
              v-model="queryOptions.name__contains"
              label="Search"
              hide-details
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="8" md="6" class="text-right">
            <!-- need RangePicker -->
            <a-range-picker
              v-model:value="value"
              :presets="rangePresets"
              @change="onRangeChange"
              :size="size"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card class="mt-2">
      <v-card-text class="table-container">
        <v-data-table-server
          :headers="headers"
          :items="usersList"
          :search="queryOptions.name__contains"
          :loading="loading"
          :items-per-page="queryOptions.page_size"
          :items-length="totalRows"
          item-value="id"
          @update:options="onUpdateOptions"
        >
          <template v-slot:item="{ item }">
            <tr class="">
              <td class="font-weight-bold text-body-2">
                <CopyLabel :text="item.value.codeforces_id" />
              </td>
              <td class="d-none"></td>
              <td>
                <div class="d-flex align-center py-1">
                  <div>
                    <v-img
                      :src="item.value.avatar"
                      width="65px"
                      class="rounded-circle img-fluid"
                    ></v-img>
                  </div>

                  <div class="ml-5">
                    <p class="font-weight-bold">
                      {{ item.value.codeforces_id }}
                    </p>
                    <span class="d-block mt-1 textSecondary">{{
                      item.value.name
                    }}</span>
                  </div>
                </div>
              </td>
              <td class="font-weight-bold text-body-2">
                <CopyLabel :text="item.value.codeforces_id" />
              </td>
              <td class="font-weight-bold">{{ item.value.points }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>
