import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { getToken } from '@/utils/auth'
import { baseURL } from '@/configs/index'
import { useSnackbarStore } from "@/stores/snackbarStore"

// create an axios instance
const service = axios.create({
    baseURL, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent
        const authStore = useAuthStore()
        if (authStore.token) {
            // let each request carry token
            // ['X-Token'] is a custom headers key
            // please modify it according to the actual situation
            config.headers['Authorization'] = 'Bearer ' + getToken()
        }
        return config
    },
    error => {
        // do something with request error
        // console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    (response) => {
        const res = response.data as any
        if (res.code >= 200 && res.code < 400) {
            return res
        } else if (res.code === 401) {
            if (res.msg.indexOf('No active account') != -1) {
                const snackbarStore = useSnackbarStore();
                snackbarStore.showErrorMessage("用户名或密码错误");
            } else {
                const snackbarStore = useSnackbarStore();
                snackbarStore.showErrorMessage("认证失败,请重新登陆");
            }
        } else if (res.code >= 400) {
            // const snackbarStore = useSnackbarStore();
            // snackbarStore.showErrorMessage("请求出错");
            return Promise.reject(new Error(res.msg || '请求出错'))
        }
    },
    (error) => {
        // console.log(error) // for debug
        const snackbarStore = useSnackbarStore();
        snackbarStore.showErrorMessage("服务器错误");
        // setTimeout(() => {
        //     location.reload()
        // }, 2000)
        return Promise.reject(error)
    }
)

export default service
