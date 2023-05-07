import { defineStore } from "pinia";
import { getUser, updateUser, changePassword } from '@/api/userApi'
import { useAuthStore } from "@/stores/authStore"

const authStore = useAuthStore()

export const useProfileStore = defineStore({
  id: "userProfile",
  state: () => ({
    basic: {
      codeforces_id: "tourist",
      id: authStore.id,
      username: authStore.username,
      realname: "",
      email: "",
      avatar: authStore.avatar,
      location: "Tokyo,Japan",
      role: authStore.perms[0],
      disabled: false,
      phone: "+1-202-555-0175",
      about: "Full Stack Developer",
      lastSignIn: "2023-03-29T01:11:13Z",
    },
    authorized: {
      google: false,
      facebook: false,
    },
    notifications: {
      officialEmails: true,
      followerUpdates: true,
    },
  }),
  actions: {
    getProfile() {
      return new Promise((resolve, reject) => {
        getUser(this.basic.id).then((response) => {
          this.basic.codeforces_id = response.data.codeforces_id
          this.basic.username = response.data.username
          this.basic.avatar = response.data.title_photo
          this.basic.phone = response.data.phone
          this.basic.id = response.data.id
          this.basic.realname = response.data.name
          this.basic.email = response.data.email
          this.basic.disabled = !response.data.is_active
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // update Basic Info
    updateBasicInfo(info) {
      const newBasicInfo = {
        name: info.realname,
        avatar: info.avatar,
      };
      return new Promise((resolve, reject) => {
        updateUser(this.basic.id, newBasicInfo).then((response) => {
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // update Password
    updatePassword(passwords) {
      const password = {
        old_password: passwords.currentPassword,
        new_password1: passwords.newPassword,
        new_password2: passwords.confirmPassword,
      };
      return new Promise((resolve, reject) => {
        changePassword(password).then((response) => {
          authStore.resetToken()
          resolve(true)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // update Authorized
    updateAuthorizedStatus(service, status) {
      this.authorized[service] = status;
    },
    // Update Notifications
    updateNotificationSettings(settings) {
      this.notifications = { ...this.notifications, ...settings };
    },
  },
});
