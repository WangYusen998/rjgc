import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { registerSW } from 'virtual:pwa-register'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './styles.css'

registerSW({ immediate: true })

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
