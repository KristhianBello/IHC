<template>
  <div class="friends-view">
    <HeaderWithProfile />

    <div class="main-content">
      <div class="content-header">
        <h1>{{ t('friendsAndConnections') }}</h1>
        <p>{{ t('connectWithOtherUsers') }}</p>
      </div>

      <FriendsManager />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeaderWithProfile from '@/components/HeaderWithProfile.vue'
import FriendsManager from '@/components/FriendsManager.vue'
import { useI18n } from '@/composables/useI18n.js'
import { getCurrentUser } from '@/lib/supabaseClient.js'

const { t } = useI18n()
const router = useRouter()

onMounted(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    router.push('/')
  }
})
</script>

<style scoped>
.friends-view {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.content-header {
  text-align: center;
  margin-bottom: 2rem;
}

.content-header h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

.content-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

/* Variables CSS */
:root {
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}

[data-theme="dark"] {
  --bg-secondary: #374151;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .content-header h1 {
    font-size: 1.75rem;
  }

  .content-header p {
    font-size: 1rem;
  }
}
</style>
