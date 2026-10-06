<template>
  <div class="auth-page">
    <div class="auth-card">
      <SignIn
        path="/sign-in"
        routing="path"
        :force-redirect-url="redirectUrl"
        sign-up-url="/sign-up"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { SignIn } from '@clerk/vue'

const route = useRoute()

const redirectUrl = computed(() => {
  const target = route.query.redirect_url
  return typeof target === 'string' && target.startsWith('/') ? target : '/statuses'
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 28rem;
}
</style>
