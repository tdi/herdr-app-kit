export type Badge = { space: string; tab: string; agent: string }

declare module 'claude-code' {
  interface PluginState {
    'herdr-badge': { badge: Badge | null }
  }
}
