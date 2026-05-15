import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { configureApi, getStoredToken } from "./services/api";
import { useAuthStore } from "./stores/auth";
import "./styles/main.css";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);

  const auth = useAuthStore();
  configureApi({
    onUnauthorized: () => {
      if (auth.isAuthenticated) {
        auth.logout();
        router.push({ name: "login" });
      }
    }
  });

  const storedToken = getStoredToken();
  if (storedToken) {
    await auth.restoreSession(storedToken);
  }

  app.use(router);
  await router.isReady();
  app.mount("#app");
}

bootstrap();
