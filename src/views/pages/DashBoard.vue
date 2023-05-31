<script setup lang="ts">
// import SalesCard from "@/components/dashboard/SalesCard.vue";
// import SourcesCard from "@/components/dashboard/SourcesCard.vue";
// import ActivityCard from "@/components/dashboard/ActivityCard.vue";
// import TableCard from "@/components/dashboard/TableCard.vue";
// import TicketsCard from "@/components/dashboard/TicketsCard.vue";
// // import TrackCard from "@/components/dashboard/TrackCard.vue";
// import TodoCard from "@/components/dashboard/TodoCard.vue";
// import TaskCard from "@/components/dashboard/ChartCard.vue";

import { useAuthStore } from "@/stores/authStore";
import {
  getUserList,
  getUserPointList,
  createUser,
  updateUser,
  deleteUser,
  get_user_by_cf_id,
} from "@/api/userApi";
import CopyLabel from "@/components/common/CopyLabel.vue";
import { ref } from "vue";
import { useSnackbarStore } from "@/stores/snackbarStore";
import AnimationWelcome from "@/components/animations/AnimationWelcome.vue";
import { userInfo } from "os";
import Snackbar from "~/src/components/common/Snackbar.vue";

const authStore = useAuthStore();
const is_admin = ref(authStore.perms[0] === "admin");
// console.log(is_admin.value);
const list = ref([]);
const loading = ref(false);
const batch_codeforces_id = ref("");
const batch_codeforces_id_list = ref([]);
const batch_codeforces_id_list_error = ref([]);
const batch_codeforces_id_list_success = ref([]);
const batch_real_name = ref("");
const batch_real_name_list = ref([]);
const batch_real_name_list_error = ref([]);
const batch_real_name_list_success = ref([]);

let batch_loading = ref(false);
let batch_loading_size = ref(0);

const freshtable = async () => {
  const usersResponse = await getUserList({});
  usersResponse.data.results = usersResponse.data.results.filter(
    (user: { username: any }) => {
      return user.username !== "admin";
    }
  );
  list.value = usersResponse.data.results;
  list.value = list.value.sort((a, b) => {
    return a.retired - b.retired;
  });
};

onMounted(async () => {
  if (!is_admin.value) return;
  freshtable();
  loading.value = true;
});
const dialog = ref(false);
const search = ref("");
const editedIndex = ref(-1);
const genderbg = ref(["male", "female"]);
const retiredbg = ref(["Active", "Retired"]);
const refForm = ref();
const editedItem = ref({
  avatar: "",
  codeforces_id: "",
  username: "",
  name: "",
  gender: "unknown",
  id_number: "",
  retired: "Active",
  student_number: "",
  email: "",
  phone: "",
});
const defaultItem = ref({
  avatar: "",
  codeforces_id: "",
  username: "",
  name: "",
  gender: "unknown",
  id_number: "",
  retired: "Active",
  student_number: "",
  email: "",
  phone: "",
});

const nameRules = [
  (v) => !!v || "Name is required",
  (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
];

const CodeforcesRules = [(v) => !!v || "Codeforces ID is required"];

//Methods
const filteredList = computed(() => {
  return list.value.filter((user: any) => {
    return user.username.toLowerCase().includes(search.value.toLowerCase());
  });
});

function editItem(item: any) {
  editedIndex.value = list.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  editedItem.value.retired = item.retired ? "Retired" : "Active";
  dialog.value = true;
}

async function deleteItem(item: any) {
  editedIndex.value = list.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  const user = await get_user_by_cf_id({
    codeforces_id: editedItem.value.codeforces_id,
  });
  await deleteUser(user.data.id, {});
  freshtable();
}

function close() {
  dialog.value = false;
  setTimeout(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  }, 300);
}

async function save() {
  // loading.value = false;
  let usersResponse = await getUserList({});
  let users = Object.keys(usersResponse.data.results).map(function (key) {
    return usersResponse.data.results[key].codeforces_id;
  });
  let exist = users.includes(editedItem.value.codeforces_id);
  const data = {
    codeforces_id: editedItem.value.codeforces_id,
    username: editedItem.value.codeforces_id,
    name: editedItem.value.name,
    gender: editedItem.value.gender,
    id_number: editedItem.value.id_number,
    retired: editedItem.value.retired === "Active" ? false : true,
    student_number: editedItem.value.student_number,
    email: editedItem.value.email,
    phone: editedItem.value.phone,
    is_active: true,
  };
  if (exist) {
    const user = await get_user_by_cf_id({
      codeforces_id: editedItem.value.codeforces_id,
    });
    await updateUser(user.data.id, data);
  } else {
    await createUser(data);
  }
  freshtable();
  // loading.value = true;
  // if (editedIndex.value > -1) {
  //   Object.assign(list.value[editedIndex.value], editedItem.value);
  // } else {
  //   list.value.push(editedItem.value);
  // }
  close();
}

//Computed Property
const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New User" : "User";
});

const chooseColor = (item: any) => {
  if (item.gender === "male") return "blue";
  else if (item.gender === "female") return "pink";
  else return "grey";
};

function clear() {
  editedItem.value = Object.assign({}, defaultItem.value);
}

const cancel = (e: MouseEvent) => {
  return;
};

async function batch_create() {
  batch_codeforces_id_list.value = batch_codeforces_id.value.split("\n");
  batch_real_name_list.value = batch_real_name.value.split("\n");

  batch_codeforces_id_list_error.value = [];
  batch_codeforces_id_list_success.value = [];
  batch_real_name_list_error.value = [];
  batch_real_name_list_success.value = [];

  batch_loading.value = true;
  // console.log(batch_codeforces_id_list.value.length);
  for (let i = 0; i < batch_codeforces_id_list.value.length; i++) {
    const data = {
      codeforces_id: batch_codeforces_id_list.value[i],
      username: batch_codeforces_id_list.value[i],
      name: batch_real_name_list.value[i],
    };
    try {
      await createUser(data);
      batch_codeforces_id_list_success.value.push(
        batch_codeforces_id_list.value[i]
      );
      batch_real_name_list_success.value.push(batch_real_name_list.value[i]);
    } catch (error) {
      batch_codeforces_id_list_error.value.push(
        batch_codeforces_id_list.value[i]
      );
      batch_real_name_list_error.value.push(batch_real_name_list.value[i]);
    }
    batch_loading_size.value =
      (i / batch_codeforces_id_list.value.length) * 100;
    batch_loading_size.value = Math.round(batch_loading_size.value);
  }

  if (batch_codeforces_id_list_error.value.length > 0) {
    const snackbarStore = useSnackbarStore();
    snackbarStore.showErrorMessage(
      "Some users are not created. Please check the list below."
    );
    batch_codeforces_id.value = batch_codeforces_id_list_error.value.join("\n");
    batch_real_name.value = batch_real_name_list_error.value.join("\n");
    batch_loading.value = false;
  } else {
    setTimeout(() => {
      batch_loading.value = false;
      close();
    }, 2000);
  }
  freshtable();
}
</script>

<template>
  <div v-if="is_admin">
    <v-container>
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="4" md="6">
              <v-text-field
                density="compact"
                v-model="search"
                label="Search"
                hide-details
                variant="outlined"
                color="primary"
              ></v-text-field>
            </v-col>
            <v-col cols="12" lg="8" md="6" class="text-right">
              <v-dialog v-model="dialog" max-width="700">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props" flat class="ml-auto">
                    <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Add
                    User
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title class="pa-4 bg-secondary">
                    <span class="title text-white">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-form
                      class="mt-5"
                      ref="form"
                      v-model="refForm"
                      lazy-validation
                    >
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            :rules="CodeforcesRules"
                            v-model="editedItem.codeforces_id"
                            label="Codeforces ID"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            :rules="nameRules"
                            :counter="10"
                            required
                            v-model="editedItem.name"
                            label="Real Name"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select
                            variant="outlined"
                            color="primary"
                            density="compact"
                            :items="genderbg"
                            v-model="editedItem.gender"
                            label="Gender"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select
                            variant="outlined"
                            color="primary"
                            density="compact"
                            :items="retiredbg"
                            v-model="editedItem.retired"
                            label="Status"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            v-model="editedItem.email"
                            label="User email"
                            type="email"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            v-model="editedItem.phone"
                            label="Phone"
                            type="phone"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            v-model="editedItem.id_number"
                            label="ID Number"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            variant="outlined"
                            color="primary"
                            density="compact"
                            v-model="editedItem.student_number"
                            label="Student Number"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                  <!-- <v-divider></v-divider> -->
                  <v-card-actions class="pa-4">
                    <v-btn color="secondary" @click="clear">Clear</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="close">Cancel</v-btn>
                    <v-btn
                      color="secondary"
                      :disabled="
                        editedItem.name == '' || editedItem.codeforces_id == ''
                      "
                      variant="flat"
                      @click="save"
                      >Save</v-btn
                    >
                  </v-card-actions>
                  <v-divider></v-divider>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-label
                          class="font-weight-medium mb-2"
                          color="primary"
                        >
                          Codeforces IDs</v-label
                        >
                        <a-textarea
                          v-model:value="batch_codeforces_id"
                          placeholder="Please enter one ID per line in the text box."
                          :auto-size="{ minRows: 2, maxRows: 7 }"
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-label class="font-weight-medium mb-2">
                          Real Names</v-label
                        >
                        <a-textarea
                          v-model:value="batch_real_name"
                          placeholder="One name per line, corresponding to Codeforces ID."
                          :auto-size="{ minRows: 2, maxRows: 7 }"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <div style="text-align: center" v-if="batch_loading">
                    <a-progress
                      type="circle"
                      :percent="batch_loading_size"
                      :size="80"
                    />
                  </div>
                  <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn
                      color="secondary"
                      :disabled="
                        batch_codeforces_id == '' || batch_real_name == ''
                      "
                      variant="flat"
                      @click="batch_create"
                      >Batch Create</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="mt-2">
        <v-table :loading="!loading" class="mt-5" v-if="loading">
          <thead>
            <tr>
              <th class="text-subtitle-1 font-weight-semibold">
                Codeforces ID
              </th>
              <th class="text-subtitle-1 font-weight-semibold">UserInfo</th>
              <th class="text-subtitle-1 font-weight-semibold">Gender</th>
              <th class="text-subtitle-1 font-weight-semibold">Phone</th>
              <th class="text-subtitle-1 font-weight-semibold">ID Number</th>
              <th class="text-subtitle-1 font-weight-semibold">
                Student Number
              </th>
              <th class="text-subtitle-1 font-weight-semibold">Status</th>
              <th class="text-subtitle-1 font-weight-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="text-body-1">
            <tr v-for="item in filteredList">
              <td class="font-weight-bold">
                <CopyLabel :text="item.codeforces_id" />
              </td>
              <td>
                <div class="d-flex align-center py-1">
                  <div>
                    <v-img
                      :src="item.avatar"
                      width="40"
                      class="rounded-circle img-fluid"
                    ></v-img>
                  </div>

                  <div class="ml-5">
                    <p class="font-weight-bold">
                      <CopyLabel :text="item.name" />
                    </p>
                    <span class="d-block mt-1 text-caption textSecondary"
                      ><CopyLabel :text="item.email"
                    /></span>
                  </div>
                </div>
              </td>
              <td>
                <v-chip
                  class="font-weight-bold"
                  :color="chooseColor(item)"
                  size="small"
                  label
                  >{{ item.gender }}</v-chip
                >
              </td>
              <td><CopyLabel :text="item.phone" /></td>
              <td><CopyLabel :text="item.id_number" /></td>
              <td><CopyLabel :text="item.student_number" /></td>
              <td>
                <div v-if="item.retired">
                  <v-chip
                    class="font-weight-bold"
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
                  <v-tooltip text="Edit">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        color="blue"
                        icon
                        variant="text"
                        @click="editItem(item)"
                        v-bind="props"
                      >
                        <v-icon>mdi-pencil-outline</v-icon>
                        <!-- <img
                        width="26"
                        src="https://img.icons8.com/fluency/48/null/edit.png"
                    /> -->
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="Delete">
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
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-container>
  </div>
  <div class="user_page" v-else>
    <AnimationWelcome :size="900" />
  </div>

  <!-- <div class="pa-5"> -->
  <!-- ---------------------------------------------- -->
  <!---First Row -->
  <!-- ---------------------------------------------- -->
  <!-- <v-row class="flex-0" dense>
      <v-col cols="12" xl="4"> -->
  <!-- Sales Card -->
  <!-- <v-card class="card-shadow" height="420"> -->
  <!-- <sales-card></sales-card> -->
  <!-- <sales-card
            :value="1837.32"
            class="h-100"
            :percentage="3.2"
            style="min-height: 380px"
            :percentage-label="$t('dashboard.lastweek')"
            :action-label="$t('dashboard.viewReport')"
          ></sales-card>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" xl="4"> -->
  <!-- Activity Card -->
  <!-- <v-card class="card-shadow" height="420">
          <activity-card></activity-card>
        </v-card>
      </v-col>
      <v-col cols="12" md="6" xl="4"> -->
  <!-- Trafiic Card-->
  <!-- <v-card class="card-shadow h-full" height="420">
          <sources-card></sources-card>
        </v-card>
      </v-col>
    </v-row> -->
  <!-- ---------------------------------------------- -->
  <!---Second Row -->
  <!-- ---------------------------------------------- -->
  <!-- <v-row class="card-shadow flex-grow-0" dense>
      <v-col cols="12" xl="6"> -->
  <!-- Table Card-->
  <!-- <v-card class="card-shadow" height="420">
          <table-card></table-card>
        </v-card>
      </v-col>
      <v-col cols="12" xl="6"> -->
  <!-- Task Card-->
  <!-- <v-card class="card-shadow" height="420">
          <task-card></task-card>
        </v-card>
      </v-col>
    </v-row> -->
  <!-- ---------------------------------------------- -->
  <!---Third Row -->
  <!-- ---------------------------------------------- -->
  <!-- <v-row class="card-shadow flex-grow-0" dense>
      <v-col cols="12" xl="6"> -->
  <!-- Target Card-->
  <!-- <v-card class="card-shadow" height="420"
          ><todo-card></todo-card
        ></v-card>
      </v-col>
      <v-col cols="12" xl="6">
        <v-card class="card-shadow" height="420"
          ><tickets-card></tickets-card>
        </v-card>
      </v-col>
    </v-row>
  </div> -->
</template>

<style lang="scss" scoped>
.user_page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  h1 {
    font-size: 2rem;
    font-weight: 500;
  }
}
</style>
