import { expect, test } from 'bun:test'
import { renderBar } from '../lib/bar.ts'

const NOW = 1_800_000_000
const plain = (s: string | null) => s?.replace(/\x1b\[[0-9;]*m/g, '') ?? null
const warm = (ttl: '5m' | '1h', secondsLeft: number, tokens = 182_000) => ({
  prompt_cache: { warm: true, ttl, expires_at: NOW + secondsLeft },
  context_window: { total_input_tokens: tokens },
})
const cells = (s: string | null) => (plain(s)?.match(/[▰▱]/g) ?? []).length

const cases: [string, ReturnType<typeof warm> | object, string | null][] = [
  ['1h warm, 55m left', warm('1h', 55 * 60), 'cache ▰▰▰▰▰▰▰▱ 55m 182k · handoff in 50m'],
  ['1h warm, 10m left', warm('1h', 10 * 60), 'cache ▰▱▱▱▱▱▱▱ 10m 182k · handoff in 5m'],
  ['1h warm, 3m left', warm('1h', 3 * 60), 'cache ▱▱▱▱▱▱▱▱ 3m 182k · handoff now'],
  ['under the floor', warm('1h', 3 * 60, 24_000), 'cache ▱▱▱▱▱▱▱▱ 3m 24k · no handoff (<floor)'],
  ['5m TTL, 4m left', warm('5m', 4 * 60), 'cache ▰▰▰▰▰▰▱▱ 4m 182k · handoff in 3m'],
  ['5m TTL, 40s left', warm('5m', 40), 'cache ▰▱▱▱▱▱▱▱ <1m 182k · handoff now'],
  ['3570s floors to 59m', warm('1h', 3570), 'cache ▰▰▰▰▰▰▰▰ 59m 182k · handoff in 54m'],
  [
    'cold',
    { prompt_cache: { warm: false, ttl: '1h', expires_at: NOW - 120 }, context_window: { total_input_tokens: 182_000 } },
    'cache ▱▱▱▱▱▱▱▱ cold',
  ],
  ['absent', { context_window: { total_input_tokens: 0 } }, null],
]

for (const [name, stdin, expected] of cases) {
  test(name, () => {
    const out = renderBar(stdin, NOW)
    expect(plain(out)).toBe(expected)
    if (expected !== null) expect(cells(out)).toBe(8)
  })
}

test('colors: green, yellow at a quarter of the TTL, red at the handoff threshold', () => {
  expect(renderBar(warm('1h', 55 * 60), NOW)).toContain('\x1b[32m')
  expect(renderBar(warm('1h', 10 * 60), NOW)).toContain('\x1b[33m')
  expect(renderBar(warm('1h', 3 * 60), NOW)).toContain('\x1b[31m')
})

test('handoffMinutes and floorTokens are configurable', () => {
  expect(plain(renderBar(warm('1h', 10 * 60), NOW, { handoffMinutes: 15, floorTokens: 80_000 }))).toContain('handoff now')
  expect(plain(renderBar(warm('1h', 10 * 60), NOW, { handoffMinutes: 5, floorTokens: 200_000 }))).toContain('no handoff (<floor)')
})
