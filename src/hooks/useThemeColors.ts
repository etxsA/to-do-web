import { useSyncExternalStore } from 'react'
import { useThemeStore } from '@/stores/themeStore'

/** Mode-aware chrome colors for inline (non-className) usages like icon tints
 *  and chart series. Mirrors the brand tokens in src/index.css. */
const LIGHT = {
  ink: '#191C23',
  muted: '#414754',
  soft: '#64748B',
  bg: '#F9F9FF',
  surface: '#FFFFFF',
  border: '#E6E8F2',
}

const DARK = {
  ink: '#F2F3FB',
  muted: '#C5CCDA',
  soft: '#9AA6BD',
  bg: '#0F1117',
  surface: '#161922',
  border: '#262D3B',
}

function subscribe(cb: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useThemeColors() {
  const mode = useThemeStore((s) => s.mode)
  const sysDark = useSyncExternalStore(subscribe, systemPrefersDark, () => false)
  const isDark = mode === 'dark' || (mode === 'system' && sysDark)
  return isDark ? DARK : LIGHT
}
