import { createApp } from 'vue'
import App from './App.vue'
import { initAMapLoader } from './utils/a-map'
import { setupRouter } from './router'
import { createPinia } from 'pinia'
import './permission'

import '@/styles/index.less'
import '@/plugins/animate.css'
import '@/plugins/svgIcon'

initAMapLoader({
  keyPair: { key: 'ca5e4ecf2567c7806d2c04b2c5742975', serviceHost: 'http://latte.hurring.cn/_AMapService' },
})

const pinia = createPinia()

const app = createApp(App).use(pinia)

setupRouter(app)

app.mount('#app')
