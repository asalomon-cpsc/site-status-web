import { createApp } from 'vue'
import { clerkPlugin } from '@clerk/vue'
import App from './App.vue'
import router from './router'
import { clerkPublishableKey, isClerkConfigured } from './auth/clerkConfig.js'
import { initTheme } from './composables/useTheme.js'

initTheme()
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/dashboard.css'

async function bootstrap() {
  const app = createApp(App)

  if (isClerkConfigured) {
    app.use(clerkPlugin, {
      publishableKey: clerkPublishableKey,
      signInForceRedirectUrl: '/statuses',
      signUpForceRedirectUrl: '/statuses',
    })
  } else {
    console.warn(
      'Clerk is not configured. Add VITE_CLERK_PUBLISHABLE_KEY to .env to enable sign-up and sign-in.'
    )
  }

  app.use(router)
  await router.isReady()
  app.mount('#app')
}

bootstrap().catch((err) => {
  console.error(err)
  const el = document.getElementById('app')
  if (el) {
    el.innerHTML = `<p style="padding:2rem;font-family:system-ui">Could not start the app: ${err.message}</p>`
  }
})
