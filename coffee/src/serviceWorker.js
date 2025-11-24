import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user asking if they want to refresh
    if (confirm('New content is available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  },
})

export default updateSW
