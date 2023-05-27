// import type { User } from "firebase/auth";
// import { db, auth } from "@/firebase";
// import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import request from '@/utils/request'
import type * as Login from "./types/login"
// export const addUserToUsersCollection = async (user: User) => {
//   const profile = {
//     id: user.uid,
//     name: user.displayName,
//     avatar: user.photoURL,
//     created: false,
//   };

//   try {
//     await setDoc(doc(db, "users", user.uid), {
//       name: user.displayName,
//       avatar: user.photoURL,
//     });
//     profile.created = true;
//   } catch (error) {
//     console.error("Error adding document: ", error);
//   }

//   return profile;
// };

// export function login(data) {
//   return request({
//     url: 'login/',
//     method: 'post',
//     data
//   })
// }
export function login(data) {
  return request({
    url: "/token/",
    method: "post",
    data
  })
}
export function logout() {
  return request({
    url: '/token/black/',
    method: 'get'
  })
}

export function getInfoApi() {
  return request({
    url: '/system/user/info/',
    method: 'get'
  })
}

export function getUserList(query) {
  return request({
    url: '/system/user/',
    method: 'get',
    params: query
  })
}

export function getUserPointList(data) {
  return request({
    url: '/system/points/get_points/',
    method: 'post',
    data
  })
}

export function get_user_by_cf_id(data) {
  return request({
    url: '/system/user/get_user_by_cf_id/',
    method: 'post',
    data
  })
}

export function get_tags_rating(data) {
  return request({
    url: '/system/tags/get_tags_rating/',
    method: 'post',
    data
  })
}

export function getUser(id) {
  return request({
    url: `/system/user/${id}/`,
    method: 'get'
  })
}

export function createUser(data) {
  return request({
    url: '/system/user/create_user/',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: 'patch',
    data
  })
}

export function deleteUser(id, data) {
  return request({
    url: `/system/user/${id}/`,
    method: 'delete',
    data
  })
}

export function changePassword(data) {
  return request({
    url: '/system/user/password/',
    method: 'put',
    data
  })
}
