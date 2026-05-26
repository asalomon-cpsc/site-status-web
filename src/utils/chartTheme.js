function readCssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/** Chart.js colors derived from Trinity CSS variables (updates when theme toggles). */
export function getChartPalette() {
  return {
    success: readCssVar('--color-success', '#4ade80'),
    successBorder: readCssVar('--color-success-border', '#22c55e'),
    danger: readCssVar('--color-danger', '#f87171'),
    dangerBorder: readCssVar('--color-danger-border', '#ef4444'),
    textMuted: readCssVar('--text-muted', '#888888'),
    text: readCssVar('--text-main', '#f0f0f0'),
    tooltipBg: readCssVar('--bg-panel', '#0d0d0d'),
    tooltipBorder: readCssVar('--border-color', '#262626'),
    grid: readCssVar('--chart-grid-color', '#262626'),
    accent: readCssVar('--text-accent', '#ff3366'),
    pointBorder: readCssVar('--bg-panel', '#0d0d0d'),
  }
}

export function chartTooltipPlugin(palette) {
  return {
    backgroundColor: palette.tooltipBg,
    titleColor: palette.text,
    bodyColor: palette.textMuted,
    borderColor: palette.tooltipBorder,
    borderWidth: 1,
    padding: 12,
  }
}

export function chartLegendLabels(palette) {
  return {
    color: palette.textMuted,
    padding: 20,
    font: { family: '"JetBrains Mono", monospace', size: 11 },
    usePointStyle: true,
    pointStyle: 'circle',
  }
}
