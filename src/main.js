import Vue from 'vue'
import 'tailwindcss/tailwind.css'

import App from './app'
import router from './mainRouter'




new Vue({
    router,
    render: h => h(App)
}).$mount('#app')