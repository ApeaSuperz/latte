import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {initAMapLoader} from "./utils/a-map.ts";

initAMapLoader({
  keyPair: {key: 'ca5e4ecf2567c7806d2c04b2c5742975', serviceHost: 'http://latte.hurring.cn/_AMapService'}
})

createApp(App).mount('#app')
