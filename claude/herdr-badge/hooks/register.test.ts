import { expect, test } from 'claude-code/testing'
import { find } from './register'

const ls = { spaces: [{ name: 'portal', tabs: [{ name: '1', terminals: [{ terminal: 't14', name: null, app: 'claude-code' }] }] }] }

test('finds the space and agent of a terminal', () => {
  expect(find(ls, 't14')).toEqual({ space: 'portal', tab: '1', agent: 'claude-code' })
  expect(find(ls, 'zz')).toBe(null)
})
