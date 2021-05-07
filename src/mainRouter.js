import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)


import btns from './components/btns.vue'
import _404 from './components/404.vue'
import share from './components/share.vue'
const routes = [
    { path: '/', name: 'index', component: btns },
    { path: '/share', name: 'share', component: share },
    { path: '*', name: '404', component: _404 }

]

// 3. 创建 router 实例，然后传 `routes` 配置
// 你还可以传别的配置参数, 不过先这么简单着吧。


export default new VueRouter({
    routes // (缩写) 相当于 routes: routes
});