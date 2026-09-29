import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { createContext, runInContext } from 'node:vm'

const require = createRequire(import.meta.url)
const coreFile = join(dirname(require.resolve('@svgdotjs/svg.js')), 'svg.js')
// No CommonJS or AMD globals: exercise the plain browser-script branch.
const context = createContext({})
runInContext(readFileSync(coreFile, 'utf8'), context)
const core = context.SVG
const originalProperties = Object.entries(core)
assert.equal(typeof core, 'function')

runInContext(
  readFileSync(new URL('../dist/svg.resize.js', import.meta.url), 'utf8'),
  context
)

assert.equal(context.SVG, core, 'The plugin must preserve the SVG function')
for (const [name, value] of originalProperties) {
  assert.equal(context.SVG[name], value, `SVG.${name} must be preserved`)
}
assert.equal(typeof core.ResizeHandler, 'function')
assert.equal(typeof core.Element.prototype.resize, 'function')
console.log('svg.resize.js browser bundle checks passed')
