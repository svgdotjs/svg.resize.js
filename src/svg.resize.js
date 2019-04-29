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
    this.eventType = ''
    this.handleResize = this.handleResize.bind(this)
    this.resize = this.resize.bind(this)
    this.endResize = this.endResize.bind(this)
    this.rotate = this.rotate.bind(this)
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
    this.eventType = e.type
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

    this.box = this.el.bbox()
    this.startPoint = this.el.point(startX, startY)

    // We consider the resize done, when a touch is canceled, too
    const eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.resize'
    const eventEnd = (isMouse ? 'mouseup' : 'touchcancel.resize touchend') + '.resize'

    // Bind resize and end events to window
    if (e.type === 'rot') {
      on(window, eventMove, this.rotate)
    } else if (e.type === 'shear') {
      on(window, eventMove, this.shear)
    } else { // resize
      on(window, eventMove, this.resize)
    }
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

    if (this.eventType.includes('l')) {
      box.x = Math.min(x, this.box.x2)
      box.x2 = Math.max(x, this.box.x2)
    }

    if (this.eventType.includes('r')) {
      box.x = Math.min(x2, this.box.x)
      box.x2 = Math.max(x2, this.box.x)
    }

    if (this.eventType.includes('t')) {
      box.y = Math.min(y, this.box.y2)
      box.y2 = Math.max(y, this.box.y2)
    }

    if (this.eventType.includes('b')) {
      box.y = Math.min(y2, this.box.y)
      box.y2 = Math.max(y2, this.box.y)
    }

    box.width = box.x2 - box.x
    box.height = box.y2 - box.y

    if (this.el.dispatch('resize', { box: new Box(box), angle: 0, shear: 0, eventType: this.eventType, event: e, handler: this }).defaultPrevented) {
      return
    }

    this.el.move(box.x, box.y).size(box.width, box.height)
  }

  rotate (e) {
    const endPoint = this.el.point(getCoordsFromEvent(e))
    const cx = this.box.cx
    const cy = this.box.cy
    const dx1 = this.startPoint.x - cx
    const dy1 = this.startPoint.y - cy
    const dx2 = endPoint.x - cx
    const dy2 = endPoint.y - cy
    const c = Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx2 * dx2 + dy2 * dy2)
    if (c === 0) {
      return
    }
    let angle = Math.acos((dx1 * dx2 + dy1 * dy2) / c) / Math.PI * 180
    if (endPoint.x < this.startPoint.x) {
      angle = -angle
    }

    this.angle = angle
    if (this.el.dispatch('resize', { box: this.startBox, angle: angle, shear: 0, eventType: this.eventType, event: e, handler: this }).defaultPrevented) {
      return
    }

    this.el.rotate(angle)
  }
  shear (e) {
    // TODO: Add shear
  }
  endResize (ev) {
    // Unbind resize and end events to window
    if (this.eventType === 'rot') { // rotate
      off(window, 'mousemove.resize touchmove.resize', this.rotate)
    } else if (this.eventType === 'shear') { // shear
      off(window, 'mousemove.resize touchmove.resize', this.shear)
    } else { // resize
      this.resize(ev)
      off(window, 'mousemove.resize touchmove.resize', this.resize)
    }
    this.eventType = ''
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
      if (enabled.prototype instanceof ResizeHandler) {
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

export default ResizeHandler
