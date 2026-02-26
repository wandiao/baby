import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import uViewPro from 'uview-pro';
import './styles/index.css';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(uViewPro);
  return {
    app,
  };
}
