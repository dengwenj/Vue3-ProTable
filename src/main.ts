import { createApp } from 'vue'

import App from './App'
import router from './router'
import 'vue3-procomponents/src/components/lib/style.css'
 
const app = createApp(App)

app.use(router)

app.mount('#app')
