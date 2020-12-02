import Vue from 'vue'
import App from './App.vue'
import '../assets/style.css'

new Vue({
  el: '#app',
  render: h => h(App)
})

Vue.config.keyCodes.tab = 9
Vue.config.keyCodes.left = 37
Vue.config.keyCodes.up = 38
Vue.config.keyCodes.right = 39
Vue.config.keyCodes.down = 40

