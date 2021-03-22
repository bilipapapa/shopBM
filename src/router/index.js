/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue';
import Welcome from '../views/Welcome.vue'
import Users from '../views/Users.vue'
import Rights from '../views/Rights.vue'
import Roles from '../views/Roles.vue'
import Parent from '../views/Parent.vue';
import Child from '../views/Child.vue'
import Categories from '../views/Categories.vue'
import Params from '../views/Params.vue';
import Goods from '../views/Goods.vue'
import Orders from '../views/Orders'
import Reports from '../views/Reports.vue';

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/welcome' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/welcome',
    children: [{ path: '/welcome', component: Welcome},
    { path: '/users', component: Users },
    { path: '/rights', component: Rights },
    { path: '/roles', component: Roles, meta: { keepAlive: true } },
    { path: '/parent', component: Parent },
    { path: '/child', component: Child },
    { path: '/categories', component: Categories },
    { path: '/params', component: Params },
    { path: '/goods', component: Goods },
    { path: '/list', redirect: '/goods'},
    { path: '/orders', component: Orders },
    { path: '/reports', component: Reports}
    ]
  }
]

const router = new VueRouter({
  routes
})

//挂载路由守卫
router.beforeEach((to, from, next) => {
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login') {
    return next()
  } else if (to.path !== '/login' && !tokenStr) {
    return next('/login')
  } else {
    next()
  }
})
export default router
