import { create } from 'zustand'

/** Small UI-coordination store so global surfaces (e.g. the ⌘K palette) can
 *  trigger the dashboard's create-list dialog without prop drilling. */
interface UiState {
  createListOpen: boolean
  setCreateListOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  createListOpen: false,
  setCreateListOpen: (createListOpen) => set({ createListOpen }),
}))
