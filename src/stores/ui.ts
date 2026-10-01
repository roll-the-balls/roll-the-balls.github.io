// View-state навигация без роутера (D-09): 5 экранов Фазы 1.
// Invite-ссылки будущих фаз читаются в main.ts через URLSearchParams — вне навигации.
import { defineStore } from 'pinia'

export type View = 'main' | 'mode' | 'opponent' | 'settings' | 'rules'

export const useUiStore = defineStore('ui', {
  state: () => ({ view: 'main' as View, rulesFor: null as string | null }),
  actions: {
    go(view: View, rulesFor?: string) {
      this.view = view
      this.rulesFor = rulesFor ?? null
    },
  },
})
