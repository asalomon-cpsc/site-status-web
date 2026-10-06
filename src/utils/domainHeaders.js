/** Normalize a pasted domain or URL to a hostname. */
export function normalizeDomain(domainOrUrl) {
  if (!domainOrUrl || typeof domainOrUrl !== 'string') return ''
  let raw = domainOrUrl.trim().toLowerCase()
  try {
    if (/^https?:\/\//i.test(raw)) {
      return new URL(raw).hostname.toLowerCase()
    }
  } catch {
    // fall through
  }
  raw = raw.split('/')[0]
  raw = raw.split(':')[0]
  return raw.replace(/^\.+|\.+$/g, '')
}

/** Common header names for autocomplete / quick-add (names only — never values). */
export const SUGGESTED_HEADERS = [
  { name: 'User-Agent', placeholder: 'e.g. azure_cpsc or WatchtowerMonitor/1.0' },
  { name: 'Authorization', placeholder: 'e.g. Bearer …' },
  { name: 'X-Api-Key', placeholder: 'API key' },
  { name: 'Accept', placeholder: 'e.g. application/json' },
  { name: 'X-Request-Id', placeholder: 'optional correlation id' }
]

export function suggestionForHeader(name) {
  const hit = SUGGESTED_HEADERS.find(
    (h) => h.name.toLowerCase() === String(name || '').toLowerCase()
  )
  return hit?.placeholder || 'Value'
}

export function hostFromUrl(url) {
  if (!url) return null
  try {
    return new URL(url.trim()).hostname.toLowerCase()
  } catch {
    return null
  }
}

/** Exact host, else longest suffix match (cpsc.gov → www.cpsc.gov). */
export function matchDomain(url, domains) {
  const host = hostFromUrl(url)
  if (!host) return null
  const list = [...new Set((domains || []).map(normalizeDomain).filter(Boolean))]
  if (list.includes(host)) return host
  return list
    .filter((d) => host.endsWith(`.${d}`))
    .sort((a, b) => b.length - a.length)[0] || null
}

export function parseHeadersJson(raw) {
  if (!raw) return []
  let map = null
  if (typeof raw === 'string') {
    try {
      map = JSON.parse(raw)
    } catch {
      return []
    }
  } else if (typeof raw === 'object' && !Array.isArray(raw)) {
    map = raw
  }
  if (!map) return []
  return Object.entries(map).map(([key, value]) => ({
    key,
    value: value == null ? '' : String(value)
  }))
}
