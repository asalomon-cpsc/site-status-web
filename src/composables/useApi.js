import { ref } from 'vue'
import { normalizeHistoryPayload } from '../utils/statusHistory'

const DEFAULT_BASE =
  'https://healthchker-akhghwe9adgxcqdt.eastus-01.azurewebsites.net/api'

/**
 * HTTP routes match the Function App’s invoke URLs (see Azure Portal or
 * `az functionapp function list -g functions-cpsc1 -n healthchker`).
 * Paths are case-insensitive on Azure; defaults match invokeUrlTemplate lowercase.
 */

/** Manual poll — GET, plain-text orchestration message */
function getPollerFunctionName() {
  const raw = import.meta.env.VITE_POLLER_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'httppollertrigger'
}

/** Monitored URL rows — GET JSON */
function getUrlListReaderFunctionName() {
  const raw = import.meta.env.VITE_URL_LIST_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'statusurllistreader'
}

/** Current site status rows — GET JSON (statusTable) */
function getStatusReaderFunctionName() {
  const raw = import.meta.env.VITE_STATUS_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'statussitestatereader'
}

/** Add / update / delete URLs — POST, PUT, DELETE (+ queue) */
function getUrlPersisterFunctionName() {
  const raw = import.meta.env.VITE_URL_PERSISTER_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'urlpersister'
}

/** Status history rows — GET JSON (statusHistoryTable) */
function getHistoryReaderFunctionName() {
  const raw = import.meta.env.VITE_HISTORY_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'statushistoryreader'
}

/** Aggregated uptime/check stats — GET JSON */
function getStatsReaderFunctionName() {
  const raw = import.meta.env.VITE_STATS_FUNCTION
  if (raw && String(raw).trim()) return String(raw).trim()
  return 'statusstatsreader'
}

function getBaseUrl() {
  // Proxy only during `vite` dev — never in production builds (Netlify has no /__healthchker route).
  const useProxy =
    import.meta.env.DEV && import.meta.env.VITE_DEV_PROXY === 'true'
  if (useProxy && typeof window !== 'undefined') {
    return `${window.location.origin}/__healthchker/api`.replace(/\/$/, '')
  }

  let base = String(import.meta.env.VITE_API_BASE_URL || '').trim()
  if (!base) base = DEFAULT_BASE
  base = base.replace(/\/$/, '')

  // Must be absolute — relative values were resolved against window.location (Netlify) by URL().
  if (!/^https?:\/\//i.test(base)) {
    console.warn('VITE_API_BASE_URL must be absolute; falling back to default Azure API base.')
    base = DEFAULT_BASE.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    try {
      if (new URL(base).origin === window.location.origin) {
        console.warn(
          'VITE_API_BASE_URL matches this site origin; falling back to default Azure API base.'
        )
        base = DEFAULT_BASE.replace(/\/$/, '')
      }
    } catch {
      base = DEFAULT_BASE.replace(/\/$/, '')
    }
  }

  return base
}

/** True when the body looks like our SPA or any HTML page, not a poller plain-text response. */
function isSpaOrHtmlBody(text) {
  if (!text || typeof text !== 'string') return false
  const head = text.slice(0, 800).trim()
  if (/^<!DOCTYPE\s+html/i.test(head) || /<html[\s>]/i.test(head)) return true
  if (/Site Status Dashboard/i.test(head) && /site-status-theme/i.test(head)) return true
  return false
}

/** For logs only — never show ?code= in UI copy. */
function redactUrlForLog(href) {
  try {
    const u = new URL(href)
    u.searchParams.delete('code')
    return u.toString()
  } catch {
    return '(invalid url)'
  }
}

function pollerResponseError() {
  return (
    'Poll hit this website instead of Azure Functions. Set VITE_API_BASE_URL to your ' +
    'Function App (…azurewebsites.net/api) in Netlify, then trigger a new deploy.'
  )
}

function getApiCode() {
  const raw = import.meta.env.VITE_API_CODE
  return typeof raw === 'string' ? raw.trim() : ''
}

/**
 * Every Azure HTTP function requires `?code=` (function or host key).
 * Local `npm run dev` must load it from `.env` via VITE_API_CODE.
 */
function requireApiCode() {
  const code = getApiCode()
  if (!code) {
    throw new Error(
      'Missing VITE_API_CODE. Copy .env.example to .env and set your Azure Functions key (required for all API calls).'
    )
  }
  return code
}

/**
 * Build an Azure Functions URL with `code` query param and extra search params.
 */
function apiUrl(path, searchParams = {}) {
  const segment = String(path).replace(/^\//, '')
  const base = getBaseUrl()
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(`${base}/${segment}`)
  url.searchParams.set('code', requireApiCode())
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v != null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  })
  return url.href
}

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  async function fetchStatuses() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl(getStatusReaderFunctionName()), {
        method: 'GET',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching statuses:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function refreshStatuses() {
    loading.value = true
    error.value = null

    const pollUrl = apiUrl(getPollerFunctionName())

    try {
      const response = await fetch(pollUrl, {
        method: 'GET',
        credentials: 'omit'
      })

      const contentType = response.headers.get('content-type') || ''
      const message = (await response.text()).trim()

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (contentType.includes('text/html') || isSpaOrHtmlBody(message)) {
        console.error('Poll returned HTML; request (redacted):', redactUrlForLog(pollUrl))
        throw new Error(pollerResponseError())
      }

      return { success: true, status: response.status, message }
    } catch (err) {
      error.value = err.message
      console.error('Error refreshing statuses:', err.message)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function fetchUrls() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl(getUrlListReaderFunctionName()), {
        method: 'GET',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching URLs:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function addUrl(urlData) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl(getUrlPersisterFunctionName()), {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          {
            urlName: urlData.urlName,
            url: urlData.url
          }
        ])
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error adding URL:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  async function updateUrl(urlData) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(apiUrl(getUrlPersisterFunctionName()), {
        method: 'PUT',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          {
            urlName: urlData.urlName,
            url: urlData.url
          }
        ])
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error updating URL:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Historical checks from storage (statusHistoryTable).
   * Returns { items, nextPageToken } — pass nextPageToken to load next page.
   */
  async function fetchStatusHistory(nextPageToken = null) {
    try {
      const params = {}
      if (nextPageToken) params.nextPageToken = nextPageToken
      const response = await fetch(apiUrl(getHistoryReaderFunctionName(), params), {
        method: 'GET',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const items = normalizeHistoryPayload(data)
      const token = (data && !Array.isArray(data) && data.nextPageToken) ? data.nextPageToken : null
      return { items, nextPageToken: token }
    } catch (err) {
      console.error('Error fetching status history:', err)
      return { items: [], nextPageToken: null }
    }
  }

  /**
   * Aggregated stats rows from statusstatsreader (for uptime/chart widgets).
   */
  async function fetchStatusStats() {
    try {
      const response = await fetch(apiUrl(getStatsReaderFunctionName()), {
        method: 'GET',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return normalizeHistoryPayload(data)
    } catch (err) {
      console.error('Error fetching status stats:', err)
      return []
    }
  }

  async function deleteUrl(urlName) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        apiUrl(getUrlPersisterFunctionName(), { urlName }),
        {
          method: 'DELETE',
          credentials: 'omit'
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      console.error('Error deleting URL:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchStatuses,
    fetchStatusHistory,
    fetchStatusStats,
    refreshStatuses,
    fetchUrls,
    addUrl,
    updateUrl,
    deleteUrl
  }
}
