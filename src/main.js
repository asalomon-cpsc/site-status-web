// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import 'bootstrap' 
import 'bootstrap/dist/css/bootstrap.min.css'
//import fontawesome from '@fortawesome/fontawesome'

//fontawesome.config.familyPrefix // default is 'fa
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
