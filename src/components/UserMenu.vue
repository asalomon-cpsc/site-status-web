<template>
  <div class="user-menu">
    <template v-if="isClerkConfigured">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" class="btn btn-secondary btn-sm">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" class="btn btn-primary btn-sm">Sign up</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <OrganizationSwitcher
          after-create-organization-url="/statuses"
          after-select-organization-url="/statuses"
          after-leave-organization-url="/statuses"
        />
        <UserButton after-sign-out-url="/welcome" />
      </Show>
    </template>
    <span v-else class="auth-muted">Auth not configured</span>
  </div>
</template>

<script setup>
import { OrganizationSwitcher, Show, SignInButton, SignUpButton, UserButton } from '@clerk/vue'
import { isClerkConfigured } from '../auth/clerkConfig.js'
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-muted {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
