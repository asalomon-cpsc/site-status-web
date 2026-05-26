<template>
  <div class="dashboard-card">
    <div class="dashboard-card-header">
      <h3 class="dashboard-card-title">Latest poll: online vs offline</h3>
    </div>
    <div class="dashboard-card-body">
      <div
        v-if="total === 0"
        class="chart-empty text-secondary"
        style="padding: 2rem; text-align: center"
      >
        No endpoint data for this poll.
      </div>
      <div v-else class="chart-container">
        <Bar :key="theme" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useTheme } from '../composables/useTheme.js'
import { getChartPalette, chartTooltipPlugin } from '../utils/chartTheme.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  statuses: {
    type: Array,
    default: () => [],
  },
})

const { theme } = useTheme()

const online = computed(() => props.statuses.filter((s) => s.status === 'OK').length)
const offline = computed(() => props.statuses.filter((s) => s.status !== 'OK').length)
const total = computed(() => props.statuses.length)

const chartData = computed(() => {
  const palette = getChartPalette()
  return {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        label: 'Endpoints',
        data: [online.value, offline.value],
        backgroundColor: [palette.success, palette.danger],
        borderColor: [palette.successBorder, palette.dangerBorder],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const palette = getChartPalette()
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...chartTooltipPlugin(palette),
        callbacks: {
          label: (ctx) => ` ${ctx.raw} endpoint(s)`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: palette.textMuted, font: { family: '"JetBrains Mono", monospace', size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: palette.textMuted,
          font: { family: '"JetBrains Mono", monospace', size: 11 },
          precision: 0,
        },
        grid: { color: palette.grid },
      },
    },
  }
})
</script>
