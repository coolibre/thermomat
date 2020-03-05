import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue'
import Main from './Main.vue';
import Login from './Login.vue';
import vuetify from './plugins/vuetify';
import API from './api';
Vue.use(VueRouter);
Vue.use(vuetify);
Vue.config.productionTip = false
const router = new VueRouter({
  routes: [{
      path: '/',
      component: Main
    },
    {
      path: '/login',
      component: Login
    }
  ]
});
Vue.prototype.$api = new API({
  proto: process.env.VUE_APP_PROTOCOL,
  port: process.env.VUE_APP_PORT,
  host: process.env.VUE_APP_HOST
}, router);
new Vue({
  vuetify,
  render: h => h(App, Main, Login),
  router
}).$mount('#app')