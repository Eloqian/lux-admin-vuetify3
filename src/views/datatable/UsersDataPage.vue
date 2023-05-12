<!--
* @Component:
* @Maintainer: J.K. Yang
* @Description:
-->
<script setup lang="ts">
import { getUserList } from "@/api/userApi"
import CopyLabel from "@/components/common/CopyLabel.vue";
import DatePicker from './DatePicker.vue'
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import router from "@/router";
const customizeTheme = useCustomizeThemeStore();
import { format, endOfMonth, endOfYear, startOfMonth, startOfYear, subMonths } from 'date-fns'

const rangeValue = ref<number[]>([])

const presetRanges = ref([
  { label: 'Today', range: [new Date(), new Date()] },
  { label: 'This month', range: [startOfMonth(new Date()), endOfMonth(new Date())] },
  {
    label: 'Last month',
    range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))],
  },
  { label: 'This year', range: [startOfYear(new Date()).getTime(), endOfYear(new Date()).getTime()] }
])

const loading = ref(true);
const totalRows = ref(0);

const queryOptions = reactive({
  name__contains: "",
  page: 1,
  per_page: 25,
  date: "",
});

const headers = [
  { title: "头像", key: "avatar" },
  { title: "用户名", key: "username" },
  { title: "cf id", key: "codeforces_id" },
  { title: "姓名", key: "name" },
  { title: "位置", key: "location", width: "200px" },
  // { title: "是否可用", key: "for_hire", align: "center" },
  // { title: "收藏数", key: "total_collections", align: "center" },
  // { title: "喜欢数", key: "total_likes", align: "center" },
  // { title: "照片数", key: "total_photos", align: "center" },
  // { title: "接受条款", key: "accepted_tos", align: "center" },
  // { title: "作品集", key: "portfolio_url" },
];

const usersList = ref([]);

const getUsers = async () => {
  loading.value = true;
  const params = queryOptions;
  const usersResponse = await getUserList(params);
  console.log(usersResponse)
  usersList.value = usersResponse.data.results.map((user: { codeforces_id: any; avatar: string; username: any; name: any; position: any; }) => {
    return {
      avatar: user.avatar,
      codeforces_id: user.codeforces_id,
      username: user.username,
      name: user.name,
      location: user.position,
      // for_hire: user.for_hire,
      // total_collections: user.total_collections,
      // total_likes: user.total_likes,
      // total_photos: user.total_photos,
      // accepted_tos: user.accepted_tos,
      // portfolio_url: user.portfolio_url,
    };
  });

  totalRows.value = usersResponse.data.count;

  loading.value = false;
};

onMounted(async () => {
  await getUsers();
});

const onUpdateOptions = async (options: { itemsPerPage: number; page: number; }) => {
  // if (!queryOptions.name__contains) return;
  queryOptions.per_page = options.itemsPerPage;
  queryOptions.page = options.page;
  await getUsers();
};

// const getLikesColor = (likes: number) => {
//   if (likes > 400) return "red";
//   else if (likes > 200) return "orange";
//   else return "grey";
// };

const onUpdateDate = async (date: any) => {
  const DateRangeFrom = format(date[0], 'yyyy-MM-dd')
  const DateRangeTo = format(date[1], 'yyyy-MM-dd')
  queryOptions.date = `${DateRangeFrom},${DateRangeTo}`
  console.log(queryOptions.date)
  await getUsers()
}

const handleRowClick = (item: {  }) => {
  console.log(item)
};
</script>

<template>
  <v-container>
    <div>
      <v-row>
        <v-col cols="12" offsetLg="9" md="4" lg="3">
          <DatePicker
            placeholder="Choose Date Range"
            v-model:date="rangeValue"
            range
            :preset-ranges="presetRanges"
            format="yyyy-MM-dd"
            :width="280"
            :dark="customizeTheme.darkTheme"
            @update:date="onUpdateDate"
          />
        </v-col>
      </v-row>
      <div></div>
      <v-row>
        <v-col cols="12" offsetLg="9" md="4" lg="3">
          <div class="mt-1 d-flex align-end">
            <!-- ---------------------------------------------- -->
            <!-- Search -->
            <!-- ---------------------------------------------- -->
            <v-text-field
              v-model="queryOptions.name__contains"
              variant="solo"
              label="Search"
              hide-details
              prepend-inner-icon="mdi-magnify"
            ></v-text-field>
          </div>
        </v-col>
      </v-row>

    </div>
    <v-divider class="my-5"></v-divider>
    <v-card>
      <v-divider />
      <v-card-text class="table-container">
        <v-data-table-server
          :headers="headers"
          :items="usersList"
          :search="queryOptions.name__contains"
          :loading="loading"
          :items-per-page="queryOptions.per_page"
          :items-length="totalRows"
          item-value="codeforces_id"
          @update:options="onUpdateOptions"
          fixed-header
          height="900"
          @item-clicked="handleRowClick"
          key="codeforces_id"
        ><template v-slot:item="{ item }">
            <tr class="">
              <td>
                <v-avatar size="30">
                  <img :src="item.columns.avatar" alt="alt" />
                </v-avatar>
              </td>
              <td class="font-weight-bold text-body-2">
                <CopyLabel :text="item.columns.username" />
              </td>
              <td>{{ item.columns.codeforces_id }}</td>

              <td>{{ item.columns.name }}</td>
              <td>{{ item.columns.location }}</td>

              <!-- <td class="text-center">
                <v-chip size="small" :color="item.columns.for_hire ? 'blue' : 'grey'" class="font-weight-bold">
                  {{ item.columns.for_hire ? "Hire" : "No Hire" }}</v-chip>
              </td>
              <td>
                {{ item.columns.total_collections }}
              </td>
              <td>
                <v-chip size="small" :color="getLikesColor(item.columns.total_likes)" class="font-weight-bold">
                  {{ item.columns.total_likes }}</v-chip>
              </td>
              <td>
                {{ item.columns.total_photos }}
              </td>
              <td class="text-center">
                <v-chip size="small" :color="item.columns.accepted_tos ? 'green' : 'pink'" class="font-weight-bold">
                  <v-icon start :icon="item.columns.accepted_tos
                      ? 'mdi-security '
                      : 'mdi-close-octagon'
                    "></v-icon>
                  {{
                    item.columns.accepted_tos ? "Accepted" : "Not Accepted"
                  }}</v-chip>
              </td>
              <td>
                <a :href="item.columns.portfolio_url" target="_blank">
                  {{ item.columns.portfolio_url }}
                </a>
              </td> -->
            </tr>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>
