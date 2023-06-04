<script setup lang="ts">
import moment from "moment";
import { formatFileSize } from "@/utils/common";
import { PoweroffOutlined } from "@ant-design/icons-vue";
import AnimationMating from "@/components/animations/AnimationMating.vue";
import AnimationChoosing from "@/components/animations/AnimationChoosing.vue";
import type { SizeType } from "ant-design-vue/es/config-provider";
import AnimationGold from "@/components/animations/AnimationGold.vue";
import AnimationSilver from "@/components/animations/AnimationSilver.vue";
import AnimationBronze from "@/components/animations/AnimationBronze.vue";
import AnimationWF from "@/components/animations/AnimationWF.vue";
import AnimationLoadingChart from "@/components/animations/AnimationLoadingChart.vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { getUserList, getUserPointList } from "@/api/userApi";
import { start } from "nprogress";
import { get_user_by_cf_id, get_tags_rating } from "@/api/userApi";
import { Ref } from "vue";
import type { EChartsOption } from "echarts";
import axios from "axios";
import { on } from "events";
import echarts, { useChart, RenderType, ThemeType } from "@/plugins/echarts";
import ApexGradientChart from "@/components/charts/apexchart/ApexGradientChart.vue";
import { time } from "console";
import dayjs, { Dayjs } from "dayjs";
const usersInfos = ref<any[]>([]);
const selectedUsersInfos = ref<any[]>([]);
const loading = ref<boolean>(false);
const size = ref<SizeType>("large");
const onlyActive = ref<boolean>(true);

const removeUser = (index: number) => {
  // console.log("index = ", index);
  selectedUsersInfos.value.splice(index, 1);
};

const removeUserbyItem = (item: any) => {
  let index = selectedUsersInfos.value.findIndex(
    (user: { codeforces_id: any }) =>
      user.codeforces_id === item.raw.codeforces_id
  );
  selectedUsersInfos.value.splice(index, 1);
};

const addUser = (user: any) => {
  if (selectedUsersInfos.value.length >= 3) {
    useSnackbarStore().showErrorMessage("最多只能选择3个队员！");
    return;
  }
  if (
    selectedUsersInfos.value.find(
      (item) => item.codeforces_id === user.raw.codeforces_id
    )
  ) {
    useSnackbarStore().showErrorMessage("队员已经存在！");
    return;
  }
  selectedUsersInfos.value.push(user.raw);
};

const searchKey = ref("");
const filteredUserInfos = computed(() => {
  return usersInfos.value.filter(
    (key) =>
      (key.name.toLowerCase().includes(searchKey.value.toLowerCase()) ||
        key.codeforces_id
          .toLowerCase()
          .includes(searchKey.value.toLowerCase())) &&
      (!onlyActive.value || !key.retired)
  );
});

onMounted(async () => {
  const usersResponse = await getUserList({});
  usersResponse.data.results = usersResponse.data.results.filter(
    (user: { username: any }) => {
      return user.username !== "admin";
    }
  );
  allusers.value = usersResponse.data.results.map(
    (user: { codeforces_id: any }) => {
      return user.codeforces_id;
    }
  );
  usersInfos.value = usersResponse.data.results.map(
    (user: {
      codeforces_id: any;
      title_photo: string;
      avatar: string;
      name: any;
      rating: any;
      phone: string;
      email: string;
      retired: boolean;
    }) => {
      return {
        avatar: user.avatar,
        title_photo: user.title_photo,
        codeforces_id: user.codeforces_id,
        name: user.name || user.codeforces_id,
        phone: user.phone,
        email: user.email,
        rating: user.rating,
        points: 0,
        retired: user.retired,
      };
    }
  );
  await getPoints();
});

const headers = [
  { title: "Avatar", key: "avatar", align: "center" },
  { title: "Name", key: "name", align: "center" },
  { title: "Codeforces ID", key: "codeforces_id", align: "center" },
  { title: "Rating", key: "rating", align: "center" },
  { title: "Points", key: "points", align: "center " },
  { title: "Phone", key: "phone", align: "center" },
  { title: "Email", key: "email", align: "center" },
  { title: "Status", key: "retired", align: "center" },
  { title: "Action", key: "select", align: "center" },
];

// datepicker & points
type RangeValue = [Dayjs, Dayjs];
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
let date_from = getlastyear();
let date_to = new Date().toISOString();
const allusers = ref([]);
const pointsList = ref({});
const check = (a: any, b: any) => {
  return (
    JSON.stringify(a) === JSON.stringify(b) &&
    queryData.date_from === date_from &&
    queryData.date_to === date_to
  );
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
  usersInfos.value.forEach((user: any) => {
    user.points = pointsList.value[user.codeforces_id];
  });
};

const onRangeChange = async (dates: RangeValue, dateStrings: string[]) => {
  if (dates) {
    date_from = dates[0].toISOString();
    date_to = dates[1].toISOString();
  }
  await getPoints();
};
const value = ref<[Dayjs, Dayjs]>([dayjs(date_from), dayjs(date_to)]);

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

const selectedUsers = (item: any) => {
  let index = selectedUsersInfos.value.findIndex(
    (user: { codeforces_id: any }) =>
      user.codeforces_id === item.raw.codeforces_id
  );
  return index === -1;
};

const setTeamDialog = ref(false);
const openTeamDialog = async () => {
  const { setOption, showLoading } = useChart(
    chartEl as Ref<HTMLDivElement>,
    true,
    true,
    RenderType.SVGRenderer,
    ThemeType.Light
  );
  const option = computed<EChartsOption>(() => ({
    backgroundColor: new echarts.graphic.RadialGradient(0, 0, 0, [
      {
        offset: 0,
        color: "#f7f8fa",
      },
      {
        offset: 1,
        color: "#cdd0d5",
      },
      {
        offset: 0.9,
        color: "#fff",
      },
    ]),
    title: {
      text: "Tags Rating",
      left: "5%",
      top: "3%",
    },
    legend: {
      right: "10%",
      top: "3%",
      data: [
        selectedUsersInfos.value[0].name,
        selectedUsersInfos.value[1].name,
        selectedUsersInfos.value[2].name,
      ],
    },
    grid: {
      left: "8%",
      top: "10%",
    },
    xAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    yAxis: {
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
      scale: true,
    },
    series: [
      {
        name: selectedUsersInfos.value[0].name,
        data: data[0],
        type: "scatter",
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5e2;
        },
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: "top",
          },
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(120, 36, 50, 0.5)",
          shadowOffsetY: 5,
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: "rgb(251, 118, 123)",
            },
            {
              offset: 1,
              color: "rgb(204, 46, 72)",
            },
          ]),
        },
      },
      {
        name: selectedUsersInfos.value[1].name,
        data: data[1],
        type: "scatter",
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5e2;
        },
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: "top",
          },
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(25, 100, 150, 0.5)",
          shadowOffsetY: 5,
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: "rgb(129, 227, 238)",
            },
            {
              offset: 1,
              color: "rgb(25, 183, 207)",
            },
          ]),
        },
      },
      {
        name: selectedUsersInfos.value[2].name,
        data: data[2],
        type: "scatter",
        symbolSize: function (data) {
          return Math.sqrt(data[2]) / 5e2;
        },
        emphasis: {
          focus: "series",
          label: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: "top",
          },
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(120, 36, 50, 0.5)",
          shadowOffsetY: 5,
          color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
            {
              offset: 0,
              color: "rgb(123, 251, 118)",
            },
            {
              offset: 1,
              color: "rgb(46, 204, 72)",
            },
          ]),
        },
      },
    ],
  }));
  loading.value = true;
  if (selectedUsersInfos.value.length < 3) {
    useSnackbarStore().showErrorMessage("至少选择3个队员！");
    loading.value = false;
    return;
  }
  await get_gredientChart();
  setTeamDialog.value = true;
  await get_echart_data();
  // 显示loading
  showLoading();
  // 假装有网络请求 ...
  // 渲染图表
  setOption(option.value);

  // watch(
  //   () => option.value,
  //   (newVal) => {
  //     setOption(newVal);
  //   },
  //   { deep: true }
  // );
  loading.value = false;
};

//Chart
// chart
const chartOptions = computed(() => {
  return {
    chart: {
      type: "line",
      height: 350,
      fontFamily: `inherit`,
      foreColor: "#a1aab2",
      toolbar: {
        show: true,
      },
      dropShadow: {
        enabled: true,
        color: "rgba(0,0,0,0.2)",
        top: 12,
        left: 4,
        blur: 3,
        opacity: 0.4,
      },
    },
    stroke: {
      width: 7,
      curve: "smooth",
    },

    xaxis: {
      type: "datetime",
      categories: [],
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        gradientToColors: ["#0b70fb"],
        shadeIntensity: 1,
        type: "horizontal",
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 100, 100, 100],
      },
    },
    yaxis: {},
    grid: {
      show: false,
    },
    tooltip: {
      theme: "light",
    },
  };
});

let gredientChart = {
  series: [],
};

const chart_loading = ref(false);
const get_gredientChart = async () => {
  // console.log(selectedUsersInfos.value);
  let data = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${selectedUsersInfos.value[0].codeforces_id}`
  );
  let result = data.data.result;
  let chart_data = {
    name: selectedUsersInfos.value[0].name,
    data: result.map((item) => {
      return {
        x: new Date(item.ratingUpdateTimeSeconds * 1000),
        y: item.newRating,
      };
    }),
  };
  gredientChart.series.push(chart_data);

  data = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${selectedUsersInfos.value[1].codeforces_id}`
  );
  result = data.data.result;
  chart_data = {
    name: selectedUsersInfos.value[1].name,
    data: result.map((item) => {
      return {
        x: new Date(item.ratingUpdateTimeSeconds * 1000),
        y: item.newRating,
      };
    }),
  };
  gredientChart.series.push(chart_data);

  data = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${selectedUsersInfos.value[2].codeforces_id}`
  );
  result = data.data.result;
  chart_data = {
    name: selectedUsersInfos.value[2].name,
    data: result.map((item) => {
      return {
        x: new Date(item.ratingUpdateTimeSeconds * 1000),
        y: item.newRating,
      };
    }),
  };
  gredientChart.series.push(chart_data);
  chart_loading.value = true;
};
let data = [];
const closeDialog = () => {
  setTeamDialog.value = false;
  gredientChart.series = [];
  chart_loading.value = false;
  echart_loading.value = false;
  teamTags.value = {};
  teamRating = undefined;
  wf = undefined;
  gold = undefined;
  silver = undefined;
  bronze = undefined;
  loading_teamRating.value = false;
  data = [];
};

// team rating
let loading_teamRating = ref(false);
let teamTags = ref({});
let teamRating;
let wf, gold, silver, bronze;
// E-chart

const echart_loading = ref(false);
const chartEl = ref<HTMLDivElement | null>(null);

const get_echart_data = async () => {
  teamTags.value = {};
  for (let i = 0; i < 3; i++) {
    let tags_rating = await get_tags_rating({
      handles: selectedUsersInfos.value[i].codeforces_id,
    });
    let tags = tags_rating.data.user_tag_rating;
    Object.keys(tags).forEach((key) => {
      if (teamTags.value[key] === undefined) {
        teamTags.value[key] = {
          tags: [tags[key].rating],
          count: tags[key].count,
        };
      } else {
        teamTags.value[key].tags.push(tags[key].rating);
        teamTags.value[key].count += tags[key].count;
      }
    });
    let echart_data = Object.keys(tags).map((key) => {
      return [
        tags[key].count,
        tags[key].rating,
        (tags[key].count + 20) * (tags[key].count + 20) * 100000,
        key + "\nrating: " + tags[key].rating + "\ncount: " + tags[key].count,
        selectedUsersInfos.value[i].name,
      ];
    });
    data.push(echart_data);
  }

  echart_loading.value = true;
  teamRating = 0;
  let count = 0;
  let resrating = [
    selectedUsersInfos.value[0].rating,
    selectedUsersInfos.value[1].rating,
    selectedUsersInfos.value[2].rating,
  ];
  resrating.sort((a, b) => b - a);
  let avarating = (resrating[0] + resrating[1] + resrating[2]) / 3;
  Object.keys(teamTags.value).forEach((key) => {
    if (teamTags.value[key].count > 15) {
      while (teamTags.value[key].tags.length < 3) {
        teamTags.value[key].tags.push(avarating);
      }
      teamTags.value[key].tags.sort((a, b) => b - a);
      teamRating +=
        teamTags.value[key].tags[0] * 1.5 +
        teamTags.value[key].tags[1] * 0.9 +
        teamTags.value[key].tags[2] * 0.6;
      count += 3;
    }
  });
  teamRating = teamRating / count;
  teamRating = teamRating.toFixed(0);
  wf = 1 / (1 + Math.pow(10, (2500 - teamRating) / 400));
  gold = 1 / (1 + Math.pow(10, (2200 - teamRating) / 400));
  silver = 1 / (1 + Math.pow(10, (1850 - teamRating) / 400));
  bronze = 1 / (1 + Math.pow(10, (1600 - teamRating) / 400));
  loading_teamRating.value = true;
};
</script>

<template>
  <v-container>
    <v-sheet
      class="d-flex align-center justify-center"
      height="480"
      v-if="selectedUsersInfos.length === 0"
    >
      <div class="text-center">
        <h3 class="text-h5 text-md-h3 font-weight-bold text-primary">
          Select TeamMembers
        </h3>
        <AnimationMating :size="350" />
      </div>
    </v-sheet>
    <v-sheet v-else>
      <perfect-scrollbar class="view pa-5">
        <!-- ---------------------------------------------- -->
        <!-- Grid View -->
        <!-- ---------------------------------------------- -->
        <v-row>
          <v-col
            class="6"
            md="4"
            lg="2"
            v-for="(usersInfo, index) in selectedUsersInfos"
          >
            <v-card>
              <v-card-title>
                <v-spacer></v-spacer>
                <v-btn
                  @click="removeUser(index)"
                  class="text-primary"
                  variant="flat"
                  ><v-icon size="30">mdi-delete</v-icon></v-btn
                ></v-card-title
              >
              <v-divider></v-divider>
              <v-card-text>
                <v-img height="150" :src="usersInfo.title_photo"></v-img>
              </v-card-text>
              <v-divider></v-divider>
              <div class="d-flex align-center pa-3 text-center">
                <div class="flex-fill">
                  <h5 class="text-h6 font-weight-bold">{{ usersInfo.name }}</h5>
                  <h6 class="text-grey">rating: {{ usersInfo.rating }}</h6>
                </div>
                <!-- <div>
                  <v-chip
                    color="primary"
                    class="font-weight-bold"
                    label
                    rounded="sm"
                    variant="elevated"
                  >
                    {{ usersInfo.type }}
                  </v-chip>
                </div> -->
              </div>
            </v-card>
          </v-col>
          <v-col
            class="if (selectedUsersInfos.length === 3) { return 6; } else-if (selectedUsersInfos.length === 2) { return 8; } else-if (selectedUsersInfos.length === 1) { return 10; }"
            md="if (selectedUsersInfos.length === 3) {
            return 6;
          } else-if (selectedUsersInfos.length === 2) {
            return 8;
          } else-if (selectedUsersInfos.length === 1) {
            return 10;
          }"
            lg="if (selectedUsersInfos.length === 3) {
            return 6;
          } else-if (selectedUsersInfos.length === 2) {
            return 8;
          } else-if (selectedUsersInfos.length === 1) {
            return 10;
          }"
          >
            <div class="text-center">
              <h3 class="text-h5 text-md-h4 font-weight-bold text-primary">
                Select TeamMembers
              </h3>
              <AnimationChoosing :size="260" />
              <a-button
                type="default"
                :loading="loading"
                :size="size"
                @click="openTeamDialog"
              >
                <h3
                  v-if="loading === false"
                  class="text-h6 text-md-h8 text-primary"
                >
                  Start analysis!
                </h3>
              </a-button>
            </div>
          </v-col>
        </v-row>
      </perfect-scrollbar>
    </v-sheet>
    <!-- <v-divider class="my-5"></v-divider> -->
  </v-container>
  <v-container>
    <v-card>
      <v-card-title class="font-weight-bold">
        <span> Players </span>
        <v-spacer></v-spacer>

        <v-col cols="12" lg="8" md="6" class="font-weight-lighter text-right">
          <a-space>
            <a-switch
              v-model:checked="onlyActive"
              checked-children="Active"
              un-checked-children="ALL"
            />
            <a-range-picker
              v-model:value="value"
              :presets="rangePresets"
              @change="onRangeChange"
              :size="size"
            />
          </a-space>
        </v-col>
        <div class="w-25">
          <v-text-field
            density="compact"
            v-model="searchKey"
            label="Search"
            hide-details
            variant="outlined"
            color="primary"
          ></v-text-field>
        </div>
      </v-card-title>
      <div class="view">
        <v-data-table
          v-model="usersInfos"
          :headers="headers"
          :items="filteredUserInfos"
          :item-per-page="50"
          :search="searchKey"
          item-value="name"
          fixed-header
          width="100%"
        >
          <template v-slot:item.name="{ item }">
            <span class="font-weight-bold">{{ item.raw.name }}</span>
          </template>
          <template v-slot:item.avatar="{ item }">
            <v-img
              class="mx-auto my-2"
              :src="item.raw.avatar"
              height="50"
              width="50"
              round="sm"
            ></v-img>
          </template>
          <template v-slot:item.retired="{ item }">
            <v-chip
              v-if="item.raw.retired"
              class="font-weight-bold"
              color="red"
              label
              size="small"
              >Retired</v-chip
            >
            <v-chip
              v-else
              class="font-weight-bold"
              color="green"
              label
              size="small"
              >Active</v-chip
            >
          </template>
          <!-- <template v-slot:item.type="{ item }">
            <v-chip class="font-weight-bold" color="primary">{{
              item.raw.type
            }}</v-chip>
          </template> -->
          <template v-slot:item.select="{ item }">
            <v-btn
              v-if="selectedUsers(item)"
              class="font-weight-bold"
              variant="flat"
              color="blue"
              @click="addUser(item)"
              >Select</v-btn
            >
            <v-btn
              v-else
              class="font-weight-bold"
              variant="flat"
              color="green"
              @click="removeUserbyItem(item)"
              >Selected!</v-btn
            >
          </template>
        </v-data-table>
      </div>
    </v-card>
  </v-container>

  <v-dialog persistent v-model="setTeamDialog" width="90%" height="90%">
    <v-card>
      <v-card-title class="pa-4 d-flex align-center">
        <span class="flex-fill">Team Rating Analysis</span>
        <v-btn
          variant="text"
          rounded
          icon="mdi-close"
          size="small"
          color="primary"
          class="mr-n3"
          @click="closeDialog"
        >
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-container>
        <v-row>
          <v-col cols="12" md="2">
            <v-card height="900px">
              <div class="d-flex flex-column pa-10">
                <v-avatar size="170" class="mx-auto elevation-12" color="white">
                  <v-img :src="selectedUsersInfos[0].title_photo"> </v-img>
                </v-avatar>
                <div class="text-center mt-5">
                  <h3>
                    {{ selectedUsersInfos[0].name }}
                  </h3>
                  <h6 class="text-grey">
                    rating: {{ selectedUsersInfos[0].rating }}
                  </h6>
                </div>
                <v-divider></v-divider>
                <v-col></v-col>
                <v-avatar size="170" class="mx-auto elevation-12" color="white">
                  <v-img :src="selectedUsersInfos[1].title_photo"> </v-img>
                </v-avatar>
                <div class="text-center mt-5">
                  <h3>
                    {{ selectedUsersInfos[1].name }}
                  </h3>
                  <h6 class="text-grey">
                    rating: {{ selectedUsersInfos[1].rating }}
                  </h6>
                </div>
                <v-divider></v-divider>
                <v-col></v-col>
                <v-avatar size="170" class="mx-auto elevation-12" color="white">
                  <v-img :src="selectedUsersInfos[2].title_photo"> </v-img>
                </v-avatar>
                <div class="text-center mt-5">
                  <h3>
                    {{ selectedUsersInfos[2].name }}
                  </h3>
                  <h6 class="text-grey">
                    rating: {{ selectedUsersInfos[2].rating }}
                  </h6>
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card height="900px">
              <v-col v-if="loading_teamRating">
                <h1 class="text-blue-grey-lighten-3 text-center">
                  Team Rating:
                </h1>
                <h1
                  class="text-h4 text-md-h3 text-deep-orange-lighten-1 font-weight-bold text-center"
                >
                  {{ teamRating }}
                </h1>
                <h1
                  class="text-h4 text-md-h7 text-dark-lighten-1 font-weight-bold text-center"
                >
                  WF: {{ (wf * 100).toFixed(2) }}%
                </h1>
                <h1
                  class="text-h4 text-md-h7 text-amber-lighten-2 font-weight-bold text-center"
                >
                  Gold: {{ (gold * 100).toFixed(2) }}%
                </h1>
                <h1
                  class="text-h4 text-md-h7 text-blue-grey-lighten-3 font-weight-bold text-center"
                >
                  Silver: {{ (silver * 100).toFixed(2) }}%
                </h1>
                <h1
                  class="text-h4 text-md-h7 text-brown-lighten-1 font-weight-bold text-center"
                >
                  Bronze: {{ (bronze * 100).toFixed(2) }}%
                </h1>
                <v-col v-if="wf > 0.5">
                  <AnimationWF :size="320" />
                  <h1
                    class="text-h4 text-md-h7 text-amber-lighten-2 font-weight-bold text-center"
                  >
                    出线冲冲冲！
                  </h1>
                </v-col>
                <v-col v-else-if="gold > 0.5">
                  <AnimationGold :size="300" />
                  <h1
                    class="text-h4 text-md-h7 text-amber-lighten-2 font-weight-bold text-center"
                  >
                    保金冲WF!
                  </h1>
                </v-col>
                <v-col v-else-if="silver > 0.5">
                  <AnimationSilver :size="300" />
                  <h1
                    class="text-h4 text-md-h7 text-blue-grey-lighten-3 font-weight-bold text-center"
                  >
                    保银冲金！
                  </h1>
                </v-col>
                <v-col v-else-if="bronze > 0.5">
                  <AnimationBronze :size="300" />
                  <h1
                    class="text-h4 text-md-h7 text-brown-lighten-1 font-weight-bold text-center"
                  >
                    保铜冲银！
                  </h1>
                </v-col>
                <v-col v-else>
                  <AnimationBronze :size="300" />
                  <h1
                    class="text-h4 text-md-h7 text-brown-lighten-1 font-weight-bold text-center"
                  >
                    努力拿牌！
                  </h1>
                </v-col>
              </v-col>
              <v-col v-else>
                <AnimationLoadingChart :size="150" :height="500" />
              </v-col>
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card height="380px">
              <v-card-text v-if="chart_loading">
                <apexchart
                  :options="chartOptions"
                  :series="gredientChart.series"
                  type="line"
                  height="350"
                ></apexchart>
              </v-card-text>
              <v-card-text v-else>
                <v-skeleton-loader type="card" height="350"></v-skeleton-loader>
              </v-card-text>
            </v-card>
            <v-col></v-col>
            <v-card v-if="echart_loading">
              <v-card-text>
                <div
                  ref="chartEl"
                  :style="{ width: `100%`, height: `465px` }"
                ></div>
              </v-card-text>
            </v-card>
            <v-card v-else>
              <v-card-text>
                <v-skeleton-loader type="card" height="435"></v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>
<style scoped lang="scss">
.font-weight-lighter {
  font-weight: lighter;
}
.red-lighten-5 {
  background-color: #ffebee;
}
.orange lighten-5 {
  background-color: #fff3e0 !important;
}
.yellow lighten-5 {
  background-color: #fffde7 !important;
}
.green lighten-5 {
  background-color: #e8f5e9 !important;
}
.blue lighten-5 {
  background-color: #e3f2fd !important;
}
.purple lighten-5 {
  background-color: #f3e5f5 !important;
}
.pink lighten-5 {
  background-color: #fce4ec !important;
}
.teal lighten-5 {
  background-color: #e0f2f1 !important;
}
.indigo lighten-5 {
  background-color: #e8eaf6 !important;
}
.red lighten-5--text {
  color: #f44336 !important;
}
</style>
