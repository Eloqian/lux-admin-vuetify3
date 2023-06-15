import router from '@/router'
import { useAuthStore } from '@/stores/authStore'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import { useSnackbarStore } from "@/stores/snackbarStore"

NProgress.configure({ showSpinner: false })

const whiteList = ['/auth/signin', '/auth/signup', '/auth/forgot-password'] // no redirect whitelist

router.beforeEach(async (to, _from, next) => {
  NProgress.start()

  const hasToken = getToken()
  if (hasToken) {
    if (to.path === "/auth/signin") {
      // 如果已经登录，并准备进入 Login 页面，则重定向到主页
      next({ path: "/dashboard" })
      NProgress.done()
    } else {
      // 检查用户是否已获得其权限角色
      const authStore = useAuthStore()
      if (authStore.perms.length === 0) {
        try {
          await authStore.getInfo()
          // const accessRoutes = await authStore.generateRoutes(perms)
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await authStore.resetToken()
          const snackbarStore = useSnackbarStore();
          snackbarStore.showErrorMessage("error");
          next("auth/signin")
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    // 如果没有 Token
    if (whiteList.indexOf(to.path) !== -1) {
      // 如果在免登录的白名单中，则直接进入
      next()
    } else {
      // 其他没有访问权限的页面将被重定向到登录页面
      next("/auth/signin")
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
