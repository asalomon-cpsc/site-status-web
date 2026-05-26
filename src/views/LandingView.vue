<template>
  <div class="landing">
    <div class="landing-theme">
      <ThemeToggle />
    </div>
    <div class="landing-card card">
      <div class="landing-brand">
        <div class="logo-mark" aria-hidden="true"></div>
        <h1>Site status</h1>
      </div>
      <p class="lead">
        Open the public <strong>Statuses</strong> view, or sign in when you use Overview, URLs,
        Charts, or History.
      </p>
      <div v-if="showUnconfigured" class="alert alert-warning" role="status">
        Azure AD is not configured. Add <code>VITE_AAD_CLIENT_ID</code> and related variables to
        <code>.env</code> (see <code>.env.example</code>) to enable Sign in.
      </div>
      <div class="landing-actions">
        <button type="button" class="btn btn-primary btn-lg landing-cta" @click="goToApp">
          Open dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { msalConfig } from '../auth/authConfig.js'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()

const showUnconfigured = computed(() => !msalConfig.auth.clientId)

function goToApp() {
  router.push('/statuses')
}
</script>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.landing-theme {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
}

.landing-card {
  max-width: 32rem;
  width: 100%;
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.landing-brand h1 {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0;
  color: var(--text-main);
}

.lead {
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 14px;
}

.landing-cta {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 12px !important;
  padding: 0.65rem 1.25rem !important;
}

.landing-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
