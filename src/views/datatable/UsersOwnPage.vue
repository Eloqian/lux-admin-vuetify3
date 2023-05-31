<!--
* @Component:
* @Maintainer: Eloqian
* @Description:
-->

<script setup lang="ts">
import { useProfileStore } from "@/stores/profileStore";
import { Icon } from "@iconify/vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import TaskCard from "@/components/dashboard/ChartCard.vue";
import { get_user_by_cf_id, get_tags_rating } from "@/api/userApi";
import type { EChartsOption } from "echarts";
import tippy from "tippy.js";
import { Ref } from "vue";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
import "tippy.js/dist/tippy.css";
import { on } from "events";
import axios from "axios";
import echarts, { useChart, RenderType, ThemeType } from "@/plugins/echarts";
import ApexGradientChart from "@/components/charts/apexchart/ApexGradientChart.vue";

const customizeTheme = useCustomizeThemeStore();
const route = useRoute();
const username = route.params.username;

const basic = reactive({
  codeforces_id: "",
  username: "",
  realname: "",
  email: "",
  avatar: "",
  location: "",
  role: "",
  disabled: false,
  about: "",
  phone: "",
  lastSignIn: "2019-09-20T01:11:13Z",
});

onMounted(async () => {
  const profile = (await get_user_by_cf_id({ codeforces_id: username })).data;
  basic.codeforces_id = profile.codeforces_id;
  basic.username = profile.username;
  basic.realname = profile.name;
  basic.email = profile.email;
  if (profile.rating > 3000) basic.role = "Legendary Grandmaster";
  else if (profile.rating > 2600) basic.role = "international grandmaster";
  else if (profile.rating > 2400) basic.role = "grandmaster";
  else if (profile.rating > 2300) basic.role = "international master";
  else if (profile.rating > 2100) basic.role = "master";
  else if (profile.rating > 1900) basic.role = "candidate master";
  else if (profile.rating > 1600) basic.role = "expert";
  else if (profile.rating > 1400) basic.role = "specialist";
  else if (profile.rating > 1200) basic.role = "pupil";
  else basic.role = "newbie";
  basic.avatar = profile.title_photo;
  basic.phone = profile.phone;

   get_gredientChart();
   get_heatmap();
   get_echart_data();
});

const heatmap_loading = ref(false);
let heatmap_data = ref([]);
const get_heatmap = async () => {
  const data = await axios.get(
    `https://codeforces.com/api/user.status?handle=${username}`
  );
  const result = data.data.result;
  let date_count = {};
  for (let i = 0; i < result.length; i++) {
    let date = new Date(result[i].creationTimeSeconds * 1000);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let key = `${year}-${month}-${day}`;
    if (date_count[key]) {
      if (result[i].verdict === "OK") date_count[key]++;
    } else date_count[key] = 1;
  }
  heatmap_data.value = Object.keys(date_count).map((key) => {
    return {
      date: key,
      count: date_count[key],
    };
  });
  // console.log(heatmap_data.value);
  heatmap_loading.value = true;
};

const chart_loading = ref(false);
const get_gredientChart = async () => {
  const data = await axios.get(
    `https://codeforces.com/api/user.rating?handle=${username}`
  );
  const result = data.data.result;
  // console.log(result);
  let chart_data = {
    name: "Rating",
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
    markers: {
      size: 4,
      opacity: 0.9,
      colors: ["#4e79ff"],
      strokeColor: "#fff",
      strokeWidth: 2,

      hover: {
        size: 7,
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

// E-chart
const echart_loading = ref(false);

const get_echart_data = async () => {
  const tags_rating = await get_tags_rating({ handles: username });
  const tags = tags_rating.data.user_tag_rating;
  // console.log("tags=", tags);
  // console.log("tags.length=", tags.length);
  let echart_data = Object.keys(tags).map((key) => {
    return [
      tags[key].count,
      tags[key].rating,
      (tags[key].count+20) * (tags[key].count+20) * 100000,
      key + "\nrating: " + tags[key].rating+"\ncount: "+tags[key].count,
      username,
    ];
  });
  // console.log("echart_data=", echart_data);
  data[0] = echart_data;
  // console.log("data=", data);

  const { setOption, showLoading } = useChart(
    chartEl as Ref<HTMLDivElement>,
    true,
    true,
    RenderType.SVGRenderer,
    ThemeType.Light
  );

  nextTick(() => {
    // 显示loading
    showLoading();
    // 假装有网络请求 ...
    // 渲染图表
    setOption(option.value);
  });

  watch(
    () => option.value,
    (newVal) => {
      setOption(newVal);
    },
    { deep: true }
  );
  echart_loading.value = true;
};
let data = [[]];

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
    data: [username],
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
      name: username,
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
  ],
}));

const chartEl = ref<HTMLDivElement | null>(null);
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3">
        <v-card height="460px">
          <div class="d-flex flex-column pa-10">
            <v-avatar size="120" class="mx-auto elevation-12" color="white">
              <v-img :src="basic.avatar"> </v-img>
            </v-avatar>

            <div class="text-center mt-5">
              <h3 class="text-h6 font-weight-bold">
                {{ basic.codeforces_id }}
                <v-chip size="small" class="font-weight-bold" color="blue">
                  {{ basic.role }}
                </v-chip>
              </h3>
              <p class="text-body-2">{{ basic.about }}</p>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="py-5 px-10">
            <v-icon color="grey"> mdi-account-outline </v-icon>
            <span class="ml-4">{{ basic.realname }}</span>
          </div>

          <v-divider></v-divider>
          <div class="py-5 px-10">
            <v-icon color="grey"> mdi-email-check-outline </v-icon>
            <span class="ml-4">{{ basic.email }}</span>
          </div>
          <v-divider></v-divider>

          <div class="py-5 px-10">
            <v-icon color="grey"> mdi-phone-outline </v-icon>
            <span class="ml-4">{{ basic.phone }}</span>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="9">
        <v-card height="460px">
          <v-card-title>
            <h3 class="text-h6 font-weight-bold">Rating Change</h3>
          </v-card-title>
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
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <v-row>
      <v-col cols="12" md="12">
        <v-card>
          <v-card-title>
            <h3 class="text-h6 font-weight-bold">Recent Activity</h3>
          </v-card-title>
          <v-card-text v-if="heatmap_loading">
            <calendar-heatmap
              :dark-mode="customizeTheme.darkTheme ? true : false"
              class="my-heatmap"
              :values="heatmap_data"
              :end-date="new Date()"
              :round="3"
              :max="10"
              tooltip-unit="heats"
            ></calendar-heatmap>
          </v-card-text>
          <v-card-text v-else>
            <v-skeleton-loader type="card" height="280"></v-skeleton-loader>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container>
    <v-row>
      <v-col cols="12" md="12">
        <v-card v-if="echart_loading">
          <v-card-text>
          <div ref="chartEl" :style="{ width: `100%`, height: `700px` }"></div>
        </v-card-text>
        </v-card>
        <v-card v-else>
          <v-skeleton-loader type="card" height="600"></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.my-heatmap {
  font-size: x-small;
}
</style>
