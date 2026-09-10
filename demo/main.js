import '../node_modules/@svgdotjs/svg.select.js/src/svg.select.css'
import '../src/main.js'
import { SVG, on } from '@svgdotjs/svg.js'
const canvas = new SVG().size('100%', '100%').addTo('#svgcontent')
canvas
  .rect(100, 100)
  .move(100, 100)
  .fill('red')
  .select({ createHandle: (el) => el.polyline().css({ stroke: '#666' }) })
  .resize()
const polygon = canvas
  // star shape
  .polygon([
    [100, 100],
    [200, 100],
    [200, 200],
    [300, 200],
    [200, 300],
    [200, 400],
    [100, 400],
    [100, 300],
    [0, 300],
    [0, 200],
    [100, 200]
  ])
  .move(250, 250)
  .fill('blue')
  .pointSelect()
  .select()
  .resize()

canvas
  .circle(100)
  .fill('green')
  .move(300, 300)
  .select()
  .resize({ preserveAspectRatio: true, aroundCenter: true })

on(document, 'keydown', (e) => {
  if (e.key === 'Shift') {
    polygon.resize({ preserveAspectRatio: true })
  }
  if (e.key === 'Control') {
    polygon.resize({ preserveAspectRatio: true, aroundCenter: true })
  }
  if (e.key === 's') {
    polygon.resize({ grid: 20, degree: 10 })
  }
})

on(document, 'keyup', () => {
  polygon.resize()
})
