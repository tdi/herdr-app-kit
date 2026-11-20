// Herdr space + agent of this terminal, above the prompt on the left.
// Claude Code has no fixed top-right slot (only toasts float there), so the band is the closest spot.
import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Badge } from '../types'

const badge = atom({ plugin: 'herdr-badge', key: 'badge' } as const, null)

type Ls = { spaces: { name: string; tabs: { name: string; terminals: { terminal: string; name: string | null; app: string | null }[] }[] }[] }

// Finds the terminal in herdr-app's tree; null when this isn't a Herdr terminal.
export function find(ls: Ls, id: string): Badge | null {
  for (const s of ls.spaces)
    for (const t of s.tabs)
      for (const term of t.terminals)
        if (term.terminal === id) return { space: s.name, tab: t.name, agent: term.name ?? term.app ?? id }
  return null
}

async function refresh($: EngineInterface) {
  const id = await $.env.get('HC_TERMINAL_ID')
  if (!id) return
  const { exitCode, stdout } = await $.process.run(['herdr-app', 'ls'], { timeoutMs: 5000 }).catch(() => ({ exitCode: 1, stdout: '' }))
  if (exitCode !== 0) return
  let found: Badge | null = null
  try { found = find(JSON.parse(stdout), id) } catch { return }
  await update($, badge, () => found)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const started = await next(e)
    void refresh($)
    return started
  })

  // Space names change (rename, move); re-read after each turn.
  on('turn.complete', async ($, e, next) => {
    void refresh($)
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const b = await read($, badge)
    if (!b || e.props.hasSurvey) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box>
        <Text color="cyan" bold>{b.space}</Text>
        <Text dimColor> · {b.agent}{b.tab !== '1' ? ` · tab ${b.tab}` : ''}</Text>
      </Box>
    )
  })
}
