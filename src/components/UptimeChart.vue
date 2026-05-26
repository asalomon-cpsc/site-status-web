<template>
  <div class="dashboard-card">
    <div class="dashboard-card-header">
      <h3 class="dashboard-card-title">Availability (latest poll)</h3>
    </div>
    <div class="dashboard-card-body">
      <div class="chart-container">
        <Doughnut :key="theme" :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../composables/useTheme.js'
import { getChartPalette, chartTooltipPlugin, chartLegendLabels } from '../utils/chartTheme.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  statuses: {
    type: Array,
    default: () => [],
  },
})

const { theme } = useTheme()

const chartData = computed(() => {
  const palette = getChartPalette()
  const online = props.statuses.filter((s) => s.status === 'OK').length
  const offline = props.statuses.filter((s) => s.status !== 'OK').length

  return {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        data: [online || 1, offline],
        backgroundColor: [palette.success, palette.danger],
        borderColor: [palette.successBorder, palette.dangerBorder],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const palette = getChartPalette()
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: chartLegendLabels(palette),
      },
      tooltip: {
        ...chartTooltipPlugin(palette),
        displayColors: true,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((context.raw / total) * 100)
            return ` ${context.label}: ${context.raw} (${percentage}%)`
          },
        },
      },
    },
  }
})
</script>
