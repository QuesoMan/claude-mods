import { expect, mock, test } from 'claude-code/testing'

test('replay-theater registers /replay and reports when there is nothing to replay', async ($, on) => {
  let registered: { name?: string } = {}
  on('session.start', async ($, e) => ({ cwd: e.cwd }) as never)
  on('session.id', async () => ({ value: 'sid' }) as never)
  on('command.register', async ($, e) => {
    registered = e as { name?: string }
    return { value: { command: 'replay' } } as never
  })
  on('ui.toast', async () => ({ value: undefined }) as never)
  const clock = mock.clock(on, { now: 0 })

  await $.session.start({ source: 'startup', cwd: '/Users/test/project', surface: 'terminal', isInteractive: true } as never)
  await clock.settle()
  expect(registered.name, '/replay is registered at session start').toBe('replay')

  const res = await $.command.run({ command: 'replay', args: '' } as never)
  expect(String((res as { text?: string }).text), 'no edits yet').toContain('no edits')
})
