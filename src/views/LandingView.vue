<template>
  <main class="home-page">
    <div class="home-grid-bg" aria-hidden="true"></div>

    <header class="home-nav">
      <button type="button" class="brand-button" @click="goHome">
        <span class="logo-mark" aria-hidden="true"></span>
        <span>Watchtower</span>
      </button>
      <div class="home-nav-actions">
        <ThemeToggle />
        <Show v-if="isClerkConfigured" when="signed-in">
          <button type="button" class="btn btn-secondary btn-sm" @click="goToApp">
            View my statuses
          </button>
        </Show>
        <Show v-if="isClerkConfigured" when="signed-out">
          <SignInButton mode="redirect" force-redirect-url="/statuses">
            <button type="button" class="btn btn-secondary btn-sm">Sign in</button>
          </SignInButton>
        </Show>
      </div>
    </header>

    <section class="hero-shell">
      <div class="hero-copy">
        <div class="eyebrow">
          <span class="pulse-dot" aria-hidden="true"></span>
          Serverless URL intelligence
        </div>
        <h1>Scale uptime monitoring without scaling operations.</h1>
        <p class="hero-lead">
          Watchtower gives developers and teams a tenant-aware status console for URLs,
          alerts, history, bulk onboarding, and WAF-friendly monitoring.
        </p>

        <div v-if="showUnconfigured" class="alert alert-warning auth-warning" role="status">
          Clerk is not configured. Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to
          <code>.env</code> to enable sign-up and sign-in.
        </div>

        <div class="hero-actions">
          <Show v-if="isClerkConfigured" when="signed-in">
            <button type="button" class="btn btn-primary btn-lg" @click="goToApp">
              Open my workspace
            </button>
          </Show>
          <Show v-if="isClerkConfigured" when="signed-out">
            <SignUpButton mode="redirect" force-redirect-url="/statuses">
              <button type="button" class="btn btn-primary btn-lg">Create free account</button>
            </SignUpButton>
            <SignInButton mode="redirect" force-redirect-url="/statuses">
              <button type="button" class="btn btn-outline-primary btn-lg">Sign in</button>
            </SignInButton>
          </Show>
          <button
            v-if="!isClerkConfigured"
            type="button"
            class="btn btn-primary btn-lg"
            @click="goToApp"
          >
            Open app
          </button>
        </div>
      </div>

      <aside class="telemetry-panel" aria-label="Current Watchtower public rollup">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Current tally</p>
            <h2>Platform signal</h2>
          </div>
          <span class="live-badge" :class="{ muted: statsLoading }">
            {{ statsLoading ? 'Loading' : 'Live' }}
          </span>
        </div>

        <div class="metric-ring" :style="{ '--uptime-deg': `${uptimePercentage * 3.6}deg` }">
          <div class="ring-value">{{ uptimePercentage }}%</div>
          <div class="ring-label">latest OK rate</div>
        </div>

        <div class="home-stats">
          <div class="home-stat success">
            <span>Up</span>
            <strong>{{ onlineCount }}</strong>
          </div>
          <div class="home-stat danger">
            <span>Down</span>
            <strong>{{ offlineCount }}</strong>
          </div>
          <div class="home-stat">
            <span>URLs tracked</span>
            <strong>{{ totalCount }}</strong>
          </div>
        </div>

        <p class="panel-footnote">
          Aggregate rollup only. Sign in to view tenant-scoped URL details, history, and alerts.
        </p>
      </aside>
    </section>

    <section class="capability-grid" aria-label="Watchtower capabilities">
      <article
        v-for="capability in capabilities"
        :key="capability.title"
        class="capability-card"
      >
        <i class="bi" :class="capability.icon" aria-hidden="true"></i>
        <h3>{{ capability.title }}</h3>
        <p>{{ capability.copy }}</p>
      </article>
    </section>

    <section class="architecture-strip">
      <div>
        <p class="panel-kicker">Architecture</p>
        <h2>Built for cheap scale, tenant safety, and boring reliability.</h2>
      </div>
      <div class="architecture-list">
        <span>.NET 10 isolated Functions</span>
        <span>Flex Consumption</span>
        <span>Durable fan-out polling</span>
        <span>Azure Tables by tenant</span>
        <span>Clerk auth</span>
        <span>ACS alerts</span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Show, SignInButton, SignUpButton } from '@clerk/vue'
import { isClerkConfigured } from '../auth/clerkConfig.js'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useApi } from '../composables/useApi.js'

const router = useRouter()
const { fetchStatuses } = useApi()
const showUnconfigured = computed(() => !isClerkConfigured)
const statuses = ref([])
const statsLoading = ref(true)

const capabilities = [
  {
    icon: 'bi-upload',
    title: 'Bulk URL onboarding',
    copy: 'Paste lists, upload spreadsheets, validate URLs, and keep every tenant workspace clean.',
  },
  {
    icon: 'bi-diagram-3',
    title: 'Tenant-aware by design',
    copy: 'Personal workspaces use user partitions; company workspaces use Clerk organization partitions.',
  },
  {
    icon: 'bi-shield-check',
    title: 'WAF-ready monitoring',
    copy: 'Publish monitoring IPs and user-agent guidance so protected sites can safely allow checks.',
  },
  {
    icon: 'bi-bell',
    title: 'Actionable alerts',
    copy: 'Durable polling records current state, history, and alert signals without managing servers.',
  },
]

const onlineCount = computed(() => statuses.value.filter((s) => s.status === 'OK').length)
const totalCount = computed(() => statuses.value.length)
const offlineCount = computed(() => Math.max(totalCount.value - onlineCount.value, 0))
const uptimePercentage = computed(() => {
  if (!totalCount.value) return 0
  return Math.round((onlineCount.value / totalCount.value) * 100)
})

onMounted(async () => {
  try {
    const data = await fetchStatuses({ publicAggregate: true })
    statuses.value = data.map((item) => ({
      status: item.Status ?? item.status,
    }))
  } finally {
    statsLoading.value = false
  }
})

function goHome() {
  router.push('/')
}

function goToApp() {
  router.push('/statuses')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 1.25rem clamp(1rem, 3vw, 2.5rem) 3rem;
  position: relative;
  overflow: hidden;
}

.home-grid-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 18% 14%, rgba(255, 51, 102, 0.18), transparent 28rem),
    radial-gradient(circle at 78% 8%, rgba(74, 222, 128, 0.12), transparent 24rem),
    linear-gradient(var(--border-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
  background-size: auto, auto, 72px 72px, 72px 72px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 88%);
  opacity: 0.58;
}

.home-nav {
  max-width: 1180px;
  margin: 0 auto 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
}

.brand-button {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
  color: var(--text-main);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.home-nav-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.hero-shell {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: center;
}

.hero-copy {
  padding: clamp(1rem, 2vw, 1.5rem) 0;
}

.eyebrow,
.panel-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-accent);
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-success);
  box-shadow: 0 0 18px rgba(74, 222, 128, 0.65);
}

.hero-copy h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(3.25rem, 8vw, 7rem);
  line-height: 0.9;
  letter-spacing: -0.08em;
}

.hero-lead {
  max-width: 650px;
  color: var(--text-muted);
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  margin: 1.35rem 0 1.75rem;
}

.auth-warning {
  max-width: 620px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.telemetry-panel,
.capability-card,
.architecture-strip {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), transparent),
    var(--bg-panel);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
}

.telemetry-panel {
  border-radius: 24px;
  padding: 1.25rem;
  position: relative;
}

.telemetry-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border-top: 3px solid var(--text-accent);
  pointer-events: none;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.panel-header h2,
.architecture-strip h2,
.capability-card h3 {
  margin: 0;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(74, 222, 128, 0.4);
  color: var(--color-success);
  background: var(--color-success-bg);
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.live-badge.muted {
  color: var(--text-muted);
  border-color: var(--border-color);
  background: var(--bg-surface);
}

.metric-ring {
  width: min(260px, 70vw);
  aspect-ratio: 1;
  margin: 1.25rem auto;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-active);
  background:
    radial-gradient(circle, var(--bg-panel) 54%, transparent 55%),
    conic-gradient(var(--text-accent) var(--uptime-deg), var(--bg-surface) 0);
  box-shadow: inset 0 0 50px rgba(255, 51, 102, 0.1);
}

.ring-value {
  font-family: var(--font-mono);
  font-size: clamp(2.75rem, 7vw, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.08em;
}

.ring-label {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.home-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.home-stat {
  padding: 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-surface);
}

.home-stat span {
  display: block;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.home-stat strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 2rem;
  line-height: 1;
}

.home-stat.success strong {
  color: var(--color-success);
}

.home-stat.danger strong {
  color: var(--color-danger);
}

.panel-footnote {
  color: var(--text-muted);
  margin: 1rem 0 0;
  font-size: 0.84rem;
}

.capability-grid {
  max-width: 1180px;
  margin: 3rem auto 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.capability-card {
  border-radius: 18px;
  padding: 1.1rem;
  min-height: 190px;
}

.capability-card i {
  color: var(--text-accent);
  font-size: 1.35rem;
}

.capability-card h3 {
  margin-top: 1rem;
  font-size: 1rem;
}

.capability-card p {
  color: var(--text-muted);
  margin: 0.7rem 0 0;
}

.architecture-strip {
  max-width: 1180px;
  margin: 1rem auto 0;
  border-radius: 22px;
  padding: 1.25rem;
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 1rem;
  align-items: center;
}

.architecture-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.architecture-list span {
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 980px) {
  .hero-shell,
  .architecture-strip {
    grid-template-columns: 1fr;
  }

  .capability-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-nav {
    align-items: flex-start;
  }

  .home-nav-actions,
  .hero-actions {
    justify-content: flex-start;
  }

  .hero-copy h1 {
    font-size: clamp(2.75rem, 15vw, 4.4rem);
  }

  .home-stats,
  .capability-grid {
    grid-template-columns: 1fr;
  }

  .telemetry-panel {
    padding: 1rem;
  }
}
</style>
