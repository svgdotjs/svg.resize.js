# svg.resize.js

An extension of [svg.js](https://github.com/svgdotjs/svg.js) which allows to resize elements which are selected with [svg.select.js](https://github.com/svgdotjs/svg.select.js)

# Demo

For a demo see http://svgdotjs.github.io/svg.resize.js/ or run `pnpm demo`,
which starts a vite dev server with the demo from `demo/`.

# Get Started

Install `svg.js`, `svg.select.js` and `svg.resize.js` using npm:

```bash
npm i @svgdotjs/svg.js @svgdotjs/svg.select.js @svgdotjs/svg.resize.js
```

Or get it from a cnd:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@svgdotjs/svg.select.js@latest/dist/svg.select.css"
/>
<script src="https://unpkg.com/@svgdotjs/svg.js"></script>
<!-- the select plugin comes bundled with the resize plugin -->
<!-- <script src="https://unpkg.com/@svgdotjs/svg.select.js"></script> -->
<script src="https://unpkg.com/@svgdotjs/svg.resize.js"></script>
```

Select and resize a rectangle using this simple piece of code:

```ts
var canvas = new SVG().addTo('body').size(500, 500)
canvas.rect(50, 50).fill('red').select().resize()
```

# Usage

Activate resizing

```ts
rect.select().resize()
```

Deactivate resizing

```ts
rect.resize(false)
```

Preserve aspect ratio, resize around center and snap to grid:

```ts
rect.resize({
  preserveAspectRatio: true,
  aroundCenter: true,
  grid: 10,
  degree: 0.1
})
```

# Options

- `preserveAspectRatio`: Preserve the aspect ratio of the element while resizing
- `aroundCenter`: Resize around the center of the element
- `grid`: Snaps the shape to a virtual grid while resizing
- `degree`: Snaps to an angle when rotating

# Events

While resizing, a `resize` event is fired. It contains the following properties (in `event.detail`):

- `box`: The resulting bounding box after the resize operation
- `angle`: The resulting rotation angle after the resize operation
- `eventType`: The type of resize operation (the event fired by the select plugin)
- `event`: The original event
- `handler`: The resize handler

```ts
rect.on('resize', (event) => {
  console.log(event.detail)
})
```

# Limiting resize / constraints

The old `constraint` option was removed in v3. To enforce minimum/maximum
sizes or keep elements inside a boundary, listen for the `resize` event and
call `preventDefault()` to reject the pending resize. The event is dispatched
with the proposed `box` before it is applied (see `src/ResizeHandler.js:204-214`),
so preventing the default leaves the element at its current size.

Max size:

```ts
rect.on('resize', (e) => {
  if (e.detail.box.width > 300) e.preventDefault()
})
```

Min size:

```ts
rect.on('resize', (e) => {
  if (e.detail.box.width < 50 || e.detail.box.height < 50) e.preventDefault()
})
```

Keep inside a boundary (e.g. a 500x500 canvas):

```ts
rect.on('resize', (e) => {
  const box = e.detail.box
  if (box.x < 0 || box.y < 0 || box.x2 > 500 || box.y2 > 500) e.preventDefault()
})
```

# Contributing

```bash
git clone https://github.com/svgdotjs/svg.resize.js.git
cd svg.resize.js
npm install
npm run dev
```

# Migration from svg.js v2

- The option naming changed a bit. Please double check
- The former events were removed. The resize event now serves the same purpose
