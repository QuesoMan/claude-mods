// Renders the prompt-cache expiry bar from the status-line stdin:
//   cache ▰▰▰▱▱▱▱▱ 23m 182k · handoff in 18m

export type Stdin = {
  // Absent before the first request of a session.
  prompt_cache?: { warm: boolean; ttl: string; expires_at: number | null } | null
  context_window?: { total_input_tokens?: number }
}

export type Options = {
  // Minutes before expiry at which a handoff is due; capped at a fifth of the TTL.
  handoffMinutes: number
  // Context size below which a handoff is not worth it.
  floorTokens: number
}

export const DEFAULTS: Options = { handoffMinutes: 5, floorTokens: 80_000 }

const CELLS = 8

const esc = (code: string) => (s: string) => `\x1b[${code}m${s}\x1b[0m`
const green = esc('32')
const yellow = esc('33')
const red = esc('31')
const dim = esc('2')
const bold = esc('1')

const mins = (seconds: number) => (seconds < 60 ? '<1m' : `${Math.floor(seconds / 60)}m`)
const kTok = (n: number) => `${Math.floor(n / 1000)}k`

export function renderBar(stdin: Stdin, nowSec: number, opts: Options = DEFAULTS): string | null {
  const pc = stdin.prompt_cache
  if (!pc) return null
  if (!pc.warm || pc.expires_at == null || pc.expires_at <= nowSec) return dim(`cache ${'▱'.repeat(CELLS)} cold`)

  const ttl = pc.ttl === '5m' ? 300 : 3600
  const left = pc.expires_at - nowSec
  const threshold = Math.min(opts.handoffMinutes * 60, ttl / 5)
  const color = left <= threshold ? red : left <= ttl / 4 ? yellow : green

  // Each cell is colored on its own so one reset code never strips the color from the cells after it.
  const filled = Math.round(Math.min(1, left / ttl) * CELLS)
  let cells = ''
  for (let i = 0; i < CELLS; i++) cells += color(i < filled ? '▰' : '▱')

  const tokens = stdin.context_window?.total_input_tokens ?? 0
  const handoff =
    tokens < opts.floorTokens
      ? dim('· no handoff (<floor)')
      : left <= threshold
        ? red(bold('· handoff now'))
        : dim(`· handoff in ${mins(left - threshold)}`)

  return `cache ${cells} ${color(mins(left))} ${dim(kTok(tokens))} ${handoff}`
}
