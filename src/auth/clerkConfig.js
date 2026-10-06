export const clerkPublishableKey =
  typeof import.meta.env.VITE_CLERK_PUBLISHABLE_KEY === 'string'
    ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.trim()
    : ''

export const isClerkConfigured = Boolean(clerkPublishableKey)

function waitForClerkLoaded(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Clerk is only available in the browser.'))
      return
    }

    if (window.Clerk?.loaded) {
      resolve(window.Clerk)
      return
    }

    const started = Date.now()
    const timer = window.setInterval(() => {
      if (window.Clerk?.loaded) {
        window.clearInterval(timer)
        resolve(window.Clerk)
        return
      }

      if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer)
        reject(new Error('Timed out waiting for Clerk to load.'))
      }
    }, 50)
  })
}

export async function getClerkSession() {
  if (!isClerkConfigured) return null
  const clerk = await waitForClerkLoaded()
  return clerk.session
}

export async function getClerkToken() {
  const session = await getClerkSession()
  if (!session) return null
  return session.getToken()
}
