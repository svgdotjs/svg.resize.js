import { Element, extend, on, off, Box } from '@svgdotjs/svg.js'

const getCoordsFromEvent = (ev) => {
  if (ev.changedTouches) {
    ev = ev.changedTouches[0]
  }
  return { x: ev.clientX, y: ev.clientY }
}

class ResizeHandler {
  constructor (el) {
    this.el = el
    this.lastCoordinates = null
    this.events = []
    this.handleResize = this.handleResize.bind(this)
    this.resize = this.resize.bind(this)
    this.endResize = this.endResize.bind(this)
  }

  active (value) {
    // remove all resize events
    this.el.off('.resize')

    if (!value) return

    this.el.on([
      'lt.resize',
      'rt.resize',
      'rb.resize',
      'lb.resize',
      't.resize',
      'r.resize',
      'b.resize',
      'l.resize',
      'rot.resize',
      'shear.resize'
    ], this.handleResize)
  }

  // This is called when a user clicks on one of the resize points
  handleResize (e) {
    if (e.type === 'rot' || e.type === 'shear') {
      return this['handle' + e.type](e)
    }

    const { x: startX, y: startY, event } = e.detail
    const isMouse = !event.type.indexOf('mouse')

    // Check for left button
    if (isMouse && (event.which || event.buttons) !== 1) {
      return
    }

    // Fire beforedrag event
    if (this.el.dispatch('beforeresize', { event: e, handler: this }).defaultPrevented) {
      return
    }

    this.events.push(e.type)
    this.box = this.el.bbox()
    this.startPoint = this.el.point(startX, startY)

    // We consider the resize done, when a touch is canceled, too
    const eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.resize'
    const eventEnd = (isMouse ? 'mouseup' : 'touchcancel.resize touchend') + '.resize'

    // Bind resize and end events to window
    on(window, eventMove, this.resize)
    on(window, eventEnd, this.endResize)
  }

  resize (e) {
    const endPoint = this.el.point(getCoordsFromEvent(e))
    const dx = endPoint.x - this.startPoint.x
    const dy = endPoint.y - this.startPoint.y

    const x = this.box.x + dx
    const y = this.box.y + dy
    const x2 = this.box.x2 + dx
    const y2 = this.box.y2 + dy

    const box = new Box(this.box)

    if (this.events.includes('l')) {
      box.x = Math.min(x, this.box.x2)
      box.x2 = Math.max(x, this.box.x2)
    }

    if (this.events.includes('r')) {
      box.x = Math.min(x2, this.box.x)
      box.x2 = Math.max(x2, this.box.x)
    }

    if (this.events.includes('t')) {
      box.y = Math.min(y, this.box.y2)
      box.y2 = Math.max(y, this.box.y2)
    }

    if (this.events.includes('b')) {
      box.y = Math.min(y2, this.box.y)
      box.y2 = Math.max(y2, this.box.y)
    }

    box.width = box.x2 - box.x
    box.height = box.y2 - box.y

    if (this.el.dispatch('resize', { box: new Box(box), event: e, handler: this }).defaultPrevented) {
      return
    }

    this.el.move(box.x, box.y).size(box.width, box.height)
  }

  endResize (ev) {
    this.resize(ev)
    this.events = []
    off(window, 'mousemove.resize touchmove.resize', this.resize)
    off(window, 'mouseup.resize touchend.resize', this.endResize)
  }

  snapToGrid (box, xGrid, yGrid = xGrid) {
    // TODO: Snap helper function
  }
}

extend(Element, {
  // Resize element with mouse
  resize: function (enabled = true) {
    var resizeHandler = this.remember('_resizeHandler')

    if (!resizeHandler) {
      if (enabled instanceof ResizeHandler) {
        /* eslint new-cap: ["error", { "newIsCap": false }] */
        resizeHandler = new enabled(this)
        enabled = true
      } else {
        resizeHandler = new ResizeHandler(this)
      }

      this.remember('_resizeHandler', resizeHandler)
    }

    resizeHandler.active(enabled)

    return this
  }
})
