import navigation from "./navigation";
import locales from "./locales";
import currency from "./currencies";

const env = process.env.NODE_ENV;
let baseURL;
if (env === 'development') {
  baseURL = 'http://localhost/api'; // 开发环境
} else if (env === 'test') {
  baseURL = 'http://192.168.1.1/api'; // 测试环境
} else if (env === 'production') {
  baseURL = 'https://elorank.cn/api'; // 生产环境
}
export { baseURL };
export default {
  // product display information
  product: {
    name: "EloRank",
    version: "1.0.0",
  },
  baseURL,
  navigation,
  locales,
  currency,
};
