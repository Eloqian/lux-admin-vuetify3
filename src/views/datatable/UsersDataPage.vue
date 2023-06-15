<!--
* @Component:
* @Maintainer: Eloqian
* @Description:
-->
<script setup lang="ts">
import { getUserList, getUserPointList } from "@/api/userApi";
import CopyLabel from "@/components/common/CopyLabel.vue";
import dayjs, { Dayjs } from "dayjs";
import { message } from "ant-design-vue";
import { LazyResult } from "postcss";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons-vue";
import { exportExcel } from "@/utils/exportExcel";
import { ref } from "vue";
type RangeValue = [Dayjs, Dayjs];

const loading = ref(true);
const totalRows = ref(0);
const onlyActive = ref(true);
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
  points_list: [],
  handles: ["Elo"],
  date_from: "",
  date_to: "",
};

const headers = [
  { title: "UserInfo", key: "codeforces_id" },
  { title: "Rating", key: "rating", sortable: true },
  { title: "Points", key: "points", sortable: true },
  { title: "Phone", key: "phone" },
  { title: "Email", key: "email" },
  { title: "Status", key: "retired", sortable: true },
  { title: "Actions", key: "actions" },
];

const usersList = ref([]);
const pointsList = ref({});
const allusers = ref([]);
let date_from = getlastyear();
let date_to = new Date().toISOString();
// console.log("date_from = ", date_from);
// console.log("date_to = ", date_to);

const value = ref<[Dayjs, Dayjs]>([dayjs(date_from), dayjs(date_to)]);

const check = (a: any, b: any) => {
  return (
    JSON.stringify(a) === JSON.stringify(b) &&
    queryData.date_from === date_from &&
    queryData.date_to === date_to
  );
};

const getPoints = async () => {
  if (
    check(queryData.handles, allusers.value) &&
    check(queryData.points_list, points_rule.value)
  ) {
    return;
  } else {
    queryData.points_list = points_rule.value;
    queryData.handles = allusers.value;
    queryData.date_from = date_from;
    queryData.date_to = date_to;
  }
  const pointResponse = await getUserPointList(queryData);
  console.log(queryData);
  pointsList.value = pointResponse.data;
  usersList.value.forEach((user: any) => {
    user.points = pointsList.value[user.codeforces_id];
  });
};

const getUsers = async () => {
  loading.value = true;
  const params = queryOptions;
  const usersResponse = await getUserList(params);
  usersResponse.data.results = usersResponse.data.results.filter(
    (user: { username: any; retired: any }) => {
      return user.username !== "admin" && (!onlyActive.value || !user.retired);
    }
  );
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
      phone: any;
      email: any;
      rating: any;
      retired: any;
    }) => {
      return {
        avatar: user.avatar,
        codeforces_id: user.codeforces_id,
        username: user.username,
        name: user.name,
        location: user.position,
        email: user.email,
        points: pointsList.value[user.codeforces_id],
        rating: user.rating,
        phone: user.phone,
        retired: user.retired,
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
  if (options.sortBy.length == 0) return;
  const sortBy = options.sortBy[0].key;
  const sortDesc = options.sortBy[0].order;
  if (sortBy) {
    usersList.value.sort((a: any, b: any) => {
      return sortDesc === "asc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
    });
  }
};

const onRangeChange = async (dates: RangeValue, dateStrings: string[]) => {
  if (dates) {
    date_from = dates[0].toISOString();
    date_to = dates[1].toISOString();
    // console.log("date_from = ", date_from);
    // console.log("date_to = ", date_to);
  }
  await getUsers();
};

const rangePresets = ref([
  { label: "Last 7 Days", value: [dayjs().add(-7, "d"), dayjs()] },
  { label: "Last 14 Days", value: [dayjs().add(-14, "d"), dayjs()] },
  { label: "Last 30 Days", value: [dayjs().add(-30, "d"), dayjs()] },
  { label: "Last 90 Days", value: [dayjs().add(-90, "d"), dayjs()] },
  { label: "Last 180 Days", value: [dayjs().add(-180, "d"), dayjs()] },
  { label: "Last 365 Days", value: [dayjs().add(-365, "d"), dayjs()] },
  { label: "Last 2 Years", value: [dayjs().add(-2, "y"), dayjs()] },
  { label: "Last 5 Years", value: [dayjs().add(-5, "y"), dayjs()] },
]);
const size = ref<any>("large");

const editItem = (item: any) => {};
const deleteItem = (item: any) => {
  // console.log("deleteItem", item);
};
const cancel = (e: MouseEvent) => {
  return;
};
const setRulesDialog = ref(false);
const openRulesDialog = () => {
  setRulesDialog.value = true;
};
const points_rule = ref([2, 2, 3, 3, 4, 5, 5, 5, 5, 5, 10]);
const saveRules = async () => {
  console.log("saveRules", points_rule.value, queryData.points_list);
  queryData.points_list = points_rule.value;
  queryData.handles = allusers.value;
  queryData.date_from = date_from;
  queryData.date_to = date_to;
  const pointResponse = await getUserPointList(queryData);
  // console.log(queryData);
  pointsList.value = pointResponse.data;
  usersList.value.forEach((user: any) => {
    user.points = pointsList.value[user.codeforces_id];
  });
  setRulesDialog.value = false;
};
const loading_export = ref<boolean>(false);
const open = ref<boolean>(false);

const showModal = () => {
  open.value = true;
};

const handleOk = () => {
  loading_export.value = true;
  setTimeout(() => {
    loading_export.value = false;
    const data = usersList.value.map((user: any) => {
      return {
        username: user.codeforces_id,
        name: user.name,
        rating: user.rating,
        points: user.points,
        phone: user.phone,
        email: user.email,
        retired: user.retired,
      };
    });
    const name = "rank_" + dayjs().format("YYYY-MM-DD") + ".xlsx";
    exportExcel(data, name);
    open.value = false;
  }, 1000);
};

const handleCancel = () => {
  open.value = false;
};
</script>
<template>
  <v-container>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="3" md="5">
            <v-text-field
              density="compact"
              v-model="queryOptions.name__contains"
              label="Search"
              hide-details
              variant="outlined"
              color="primary"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="9" md="7" class="text-right">
            <a-space>
              <a-switch
                v-model:checked="onlyActive"
                checked-children="Active"
                un-checked-children="ALL"
                @click="getUsers"
              />
              <a-button type="default" :size="size" @click="openRulesDialog">
                Set Rules
              </a-button>
              <!-- need RangePicker -->
              <a-range-picker
                v-model:value="value"
                :presets="rangePresets"
                @change="onRangeChange"
                :size="size"
              />
              <a-button type="default" :size="size" @click="showModal"
                >Export</a-button
              >
              <a-modal v-model:open="open" title="Export Excel" @ok="handleOk">
                <template #footer>
                  <a-button key="back" @click="handleCancel">Return</a-button>
                  <a-button
                    key="submit"
                    type="primary"
                    :loading="loading_export"
                    @click="handleOk"
                    >Exprot</a-button
                  >
                </template>
                <p>Do you want to export the current list?</p>
              </a-modal>
            </a-space>
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
              <td class="d-none"></td>
              <td>
                <div class="d-flex align-center py-1">
                  <div>
                    <v-img
                      :src="item.value.avatar"
                      width="65px"
                      height="65px"
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
              <td class="font-weight-bold">{{ item.value.rating }}</td>
              <td class="font-weight-bold">{{ item.value.points }}</td>
              <td class="font-weight-bold text-body-2">
                <CopyLabel :text="item.value.phone" />
              </td>
              <td class="font-weight-bold text-body-2">
                <CopyLabel :text="item.value.email" />
              </td>
              <td>
                <div v-if="item.value.retired">
                  <v-chip
                    class="font-weight-bold align-center justify-center"
                    color="red"
                    size="small"
                    label
                    >Retired</v-chip
                  >
                </div>
                <div v-else>
                  <v-chip
                    class="font-weight-bold"
                    color="green"
                    size="small"
                    label
                    >Active</v-chip
                  >
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <v-tooltip text="Open">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="blue"
                        icon
                        variant="text"
                        v-bind="props"
                        :to="`/data/users/${item.value.codeforces_id}`"
                      >
                        <v-icon>mdi-open-in-new </v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <!-- <v-tooltip text="Delete">
                    <template v-slot:activator="{ props }">
                      <a-popconfirm
                        title="Are you sure delete this user?"
                        ok-text="Yes"
                        v-bind="props"
                        cancel-text="No"
                        @confirm="deleteItem(item)"
                        @cancel="cancel"
                      >
                        <v-icon>mdi-delete-outline</v-icon>
                      </a-popconfirm>
                    </template>
                  </v-tooltip> -->
                </div>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>

  <v-dialog persistent v-model="setRulesDialog" width="600">
    <v-card>
      <v-card-title class="pa-4 d-flex align-center">
        <span class="flex-fill">Edit Rules</span>
        <v-btn
          variant="text"
          rounded
          icon="mdi-close"
          size="small"
          color="primary"
          class="mr-n3"
          @click="setRulesDialog = false"
        >
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> A </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[0]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[0]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> B </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[1]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[1]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>

      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> C </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[2]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[2]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>

      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> D </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[3]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[3]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> E </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[4]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[4]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> F </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[5]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[5]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> G </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[6]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[6]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> H </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[7]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[7]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="1">
          <a-button type="default" :size="size"> >H </a-button>
        </v-col>
        <v-col cols="12" md="8">
          <a-slider v-model:value="points_rule[8]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[8]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="12">
          <a-button type="default" :size="size"> 参与训练赛积分 </a-button>
        </v-col>
        <v-col cols="12" md="9">
          <a-slider v-model:value="points_rule[9]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[9]"
            :min="0"
            :max="10"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>
      <a-row>
        <v-col cols="12" md="12">
          <a-button type="default" :size="size"> 训练赛奖励积分池 </a-button>
        </v-col>
        <v-col cols="12" md="9">
          <a-slider v-model:value="points_rule[10]" :min="0" :max="10" />
        </v-col>
        <v-col cols="12" md="2">
          <a-input-number
            v-model:value="points_rule[10]"
            :min="0"
            :max="20"
            style="margin-left: 16px"
          />
        </v-col>
      </a-row>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-btn variant="outlined" @click="setRulesDialog = false">Cancel</v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="primary" @click="saveRules">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
