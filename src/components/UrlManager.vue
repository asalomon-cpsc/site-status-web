<template>
  <div class="dashboard-card">
    <div class="dashboard-card-header">
      <h3 class="dashboard-card-title">Monitored URLs</h3>
      <button class="btn btn-primary" type="button" @click="openAddModal">
        Add URL
      </button>
    </div>
    <div class="dashboard-card-body">
      <div
        v-if="actionMessage"
        class="alert mb-3"
        :class="actionSuccess ? 'alert-success' : 'alert-danger'"
        role="alert"
      >
        {{ actionMessage }}
      </div>
      <div v-if="urls.length === 0" class="empty-state">
        <h4>No URLs configured</h4>
        <p>Use Add URL to register endpoints.</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Visibility</th>
            <th>URL</th>
            <th style="width: 120px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="url in urls" :key="url.UrlName || url.urlName">
            <td>
              <strong>{{ url.UrlName || url.urlName }}</strong>
            </td>
            <td>
              <span class="cat-pill">{{ displayCategory(url) }}</span>
            </td>
            <td>
              <span
                class="vis-pill"
                :class="(url.Visibility || url.visibility || 'private') === 'public' ? 'is-public' : 'is-private'"
              >
                {{ url.Visibility || url.visibility || 'private' }}
              </span>
            </td>
            <td>
              <a
                class="link-dashboard"
                :href="url.Url || url.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ url.Url || url.url }}
              </a>
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon" type="button" title="Edit" @click="openEditModal(url)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn-icon danger"
                  type="button"
                  title="Delete"
                  @click="handleDelete(url.UrlName || url.urlName)"
                >
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Teleport to body — Bootstrap modal + dashboard overflow froze inputs on SWA -->
  <Teleport to="body">
    <div
      v-if="modalOpen"
      class="url-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="url-modal-title"
      @keydown.escape.prevent="closeModal"
    >
      <button
        type="button"
        class="url-modal-backdrop"
        aria-label="Close dialog"
        @click="closeModal"
      />
      <div class="url-modal-dialog" @click.stop>
        <div class="url-modal-header">
          <h5 id="url-modal-title" class="modal-title">
            {{ isEditing ? 'Edit URL' : 'Add URL' }}
          </h5>
          <button type="button" class="btn-close" aria-label="Close" @click="closeModal" />
        </div>
        <form class="url-modal-body" @submit.prevent="handleSave">
          <div class="mb-3">
            <label class="form-label" for="url-name">Site / endpoint name</label>
            <input
              id="url-name"
              ref="nameInput"
              v-model="formData.urlName"
              type="text"
              class="form-control"
              :readonly="isEditing"
              placeholder="e.g., API Health"
              autocomplete="off"
              tabindex="0"
            >
          </div>
          <div class="mb-3">
            <label class="form-label" for="url-value">URL</label>
            <input
              id="url-value"
              v-model="formData.url"
              type="url"
              class="form-control"
              placeholder="https://example.com/health"
              autocomplete="off"
              tabindex="0"
            >
          </div>
          <div class="mb-3">
            <label class="form-label" for="url-category">Category</label>
            <select id="url-category" v-model="formData.category" class="form-control">
              <option v-for="opt in categoryOptions" :key="opt" :value="opt">{{ opt }}</option>
              <option value="Custom">Custom (free text)</option>
            </select>
          </div>
          <div v-if="formData.category === 'Custom'" class="mb-3">
            <label class="form-label" for="url-category-custom">Custom category</label>
            <input
              id="url-category-custom"
              v-model="formData.categoryCustom"
              type="text"
              class="form-control"
              placeholder="e.g., Billing webhook"
              maxlength="64"
              autocomplete="off"
            >
          </div>
          <div class="mb-3">
            <label class="form-label">Visibility</label>
            <div class="vis-toggle">
              <label class="vis-option">
                <input v-model="formData.visibility" type="radio" value="private">
                <span>Private</span>
                <small>Only your signed-in workspace</small>
              </label>
              <label class="vis-option">
                <input v-model="formData.visibility" type="radio" value="public">
                <span>Public</span>
                <small>Shown on the landing directory</small>
              </label>
            </div>
          </div>
          <div
            v-if="formMessage"
            class="small"
            :style="{
              marginTop: '0.5rem',
              color: formSuccess ? 'var(--success)' : 'var(--danger)'
            }"
          >
            {{ formMessage }}
          </div>
          <div class="url-modal-footer url-modal-footer-inline">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useApi } from '../composables/useApi'

const emit = defineEmits(['urlUpdated'])

const CATEGORY_OPTIONS = [
  'Landing',
  'API',
  'Intake',
  'Documentation',
  'General',
  'Auth',
  'Search'
]

const { fetchUrls, addUrl, updateUrl, deleteUrl } = useApi()

const urls = ref([])
const isEditing = ref(false)
const modalOpen = ref(false)
const saving = ref(false)
const formMessage = ref('')
const formSuccess = ref(false)
const actionMessage = ref('')
const actionSuccess = ref(false)
const nameInput = ref(null)
const categoryOptions = CATEGORY_OPTIONS

const emptyForm = () => ({
  urlName: '',
  url: '',
  category: 'General',
  categoryCustom: '',
  visibility: 'private'
})

const formData = ref(emptyForm())

function resolveCategory(category, categoryCustom) {
  if (category === 'Custom') {
    return (categoryCustom || '').trim() || 'Custom'
  }
  return category || 'General'
}

function displayCategory(url) {
  return url.Category || url.category || 'General'
}

function splitCategory(raw) {
  const value = (raw || 'General').trim()
  if (CATEGORY_OPTIONS.includes(value)) {
    return { category: value, categoryCustom: '' }
  }
  return { category: 'Custom', categoryCustom: value }
}

async function loadUrls() {
  const data = await fetchUrls()
  urls.value = Array.isArray(data) ? data : []
}

function lockBodyScroll(lock) {
  document.body.style.overflow = lock ? 'hidden' : ''
}

async function openAddModal() {
  isEditing.value = false
  formData.value = emptyForm()
  formMessage.value = ''
  modalOpen.value = true
  lockBodyScroll(true)
  await nextTick()
  nameInput.value?.focus()
}

async function openEditModal(url) {
  const split = splitCategory(url.Category || url.category)
  isEditing.value = true
  formData.value = {
    urlName: url.UrlName || url.urlName || '',
    url: url.Url || url.url || '',
    category: split.category,
    categoryCustom: split.categoryCustom,
    visibility: url.Visibility || url.visibility || 'private'
  }
  formMessage.value = ''
  modalOpen.value = true
  lockBodyScroll(true)
  await nextTick()
  nameInput.value?.focus()
}

function closeModal() {
  modalOpen.value = false
  lockBodyScroll(false)
  formMessage.value = ''
}

async function handleSave() {
  if (!formData.value.urlName?.trim() || !formData.value.url?.trim()) {
    formMessage.value = 'Please fill in name and URL'
    formSuccess.value = false
    return
  }

  if (formData.value.category === 'Custom' && !formData.value.categoryCustom?.trim()) {
    formMessage.value = 'Enter a custom category, or pick a preset'
    formSuccess.value = false
    return
  }

  saving.value = true
  formMessage.value = ''

  const payload = {
    urlName: formData.value.urlName.trim(),
    url: formData.value.url.trim(),
    category: resolveCategory(formData.value.category, formData.value.categoryCustom),
    visibility: formData.value.visibility === 'public' ? 'public' : 'private'
  }

  const result = isEditing.value
    ? await updateUrl(payload)
    : await addUrl(payload)

  if (result.success) {
    formMessage.value = isEditing.value ? 'URL updated.' : 'URL added.'
    formSuccess.value = true
    await loadUrls()
    emit('urlUpdated')
    setTimeout(closeModal, 600)
  } else {
    formMessage.value = result.error || 'An error occurred'
    formSuccess.value = false
  }

  saving.value = false
}

async function handleDelete(urlName) {
  if (!urlName) return
  if (!confirm(`Delete "${urlName}"?`)) return

  actionMessage.value = ''
  const result = await deleteUrl(urlName)
  if (result.success) {
    actionMessage.value = `"${urlName}" deleted.`
    actionSuccess.value = true
    await loadUrls()
    emit('urlUpdated')
    setTimeout(() => { actionMessage.value = '' }, 5000)
  } else {
    actionMessage.value = result.error || `Failed to delete "${urlName}".`
    actionSuccess.value = false
  }
}

onMounted(loadUrls)
onUnmounted(() => lockBodyScroll(false))
</script>

<style scoped>
.cat-pill,
.vis-pill {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  white-space: nowrap;
}

.vis-pill.is-public {
  border-color: var(--color-success, #22c55e);
  color: var(--color-success, #22c55e);
}

.vis-pill.is-private {
  color: var(--text-muted);
}

.vis-toggle {
  display: grid;
  gap: 0.5rem;
}

.vis-option {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.55rem;
  row-gap: 0.1rem;
  align-items: start;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--bg-surface);
}

.vis-option input {
  grid-row: 1 / span 2;
  margin-top: 0.2rem;
}

.vis-option span {
  font-weight: 600;
  font-size: 0.875rem;
}

.vis-option small {
  grid-column: 2;
  color: var(--text-muted);
  font-size: 0.75rem;
}
</style>

<!-- Unscoped: Teleport-to-body must not depend on data-v-* for stacking / clicks -->
<style>
.url-modal-root {
  position: fixed;
  inset: 0;
  z-index: 12000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
}

.url-modal-backdrop {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  pointer-events: auto;
}

.url-modal-dialog {
  position: relative;
  z-index: 1;
  width: min(480px, 100%);
  max-height: min(90vh, 720px);
  overflow: auto;
  background: var(--bg-panel, #141414);
  border: 1px solid var(--border-color, #333);
  border-radius: var(--radius-md, 8px);
  color: var(--text-main, #f5f5f5);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}

.url-modal-dialog input,
.url-modal-dialog select,
.url-modal-dialog button,
.url-modal-dialog textarea {
  pointer-events: auto;
}

.url-modal-header,
.url-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid var(--border-color, #333);
}

.url-modal-footer,
.url-modal-footer-inline {
  border-bottom: 0;
  border-top: 1px solid var(--border-color, #333);
  justify-content: flex-end;
}

.url-modal-body {
  padding: 1.15rem;
  margin: 0;
}

.url-modal-footer-inline {
  margin: 1rem -1.15rem -1.15rem;
  padding: 0.85rem 1.15rem;
}
</style>
