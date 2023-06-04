import { defineStore } from "pinia";
import { login, logout, createUser, getInfoApi } from '@/api/userApi'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router from "@/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    name: ref<string>(""),
    codeforces_id: ref<string>(""),
    phone: ref<string>(""),
    id: ref<string>(""),
    mail: ref<string>(""),
    username: ref<string>(""),
    avatar: ref<string>(""),
    perms: ref<string[]>([]),
    token: ref<string>(getToken() || ""),
    isLoggedIn: false,
    user: null,
  }),

  persist: {
    enabled: true,
    strategies: [{ storage: localStorage, paths: ["isLoggedIn"] }],
  },

  getters: {},

  actions: {
    setLoggedIn(payload: boolean) {
      this.isLoggedIn = payload;
    },

    registerWithEmailAndPassword(codeforces_id: string, email: string, password: string) {
      return new Promise((resolve, reject) => {
        createUser({
          codeforces_id: codeforces_id.trim(),
          email: email.trim(),
          password: password,
          is_active: true,
          username: codeforces_id.trim(),
          roles: [2],
        }).then((response) => {
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },

    loginWithEmailAndPassword(username: string, password: string) {
      return new Promise((resolve, reject) => {
        login({ username: username.trim(), password: password }).then((response) => {
          this.token = response.data.access
          setToken(this.token)
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },

    loginWithGoogle() {
      router.push("/");
    },

    logout() {
      removeToken()
      this.token = ref<string>("")
      this.perms = []
      router.push({ name: "auth-signin" });
    },

    getInfo() {
      return new Promise((resolve, reject) => {
        getInfoApi().then((res) => {
          const data = res.data
          this.username = data.username
          this.name = data.name
          this.codeforces_id = data.codeforces_id
          this.phone = data.phone
          this.id = data.id
          this.mail = data.mail
          this.avatar = data.avatar
          if (data.perms.length > 0) {
            this.perms = data.perms
          } else {
            this.perms = ["DEFAULT_ROLE"]
          }
          resolve(res)
        }).catch((error) => {
          reject(error)
        })
      })
    },

    // remove token
    resetToken() {
      removeToken() // must remove  token  first
      this.token = ref<string>("")
      this.perms = []
    }
  },
});
