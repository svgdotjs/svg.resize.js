// CJS type entry: mirrors svg.resize.js.d.ts for require() consumers
import type { Box, Element, Point } from '@svgdotjs/svg.js'

export interface ResizeOptions {
  preserveAspectRatio?: boolean
  aroundCenter?: boolean
  grid?: number
  degree?: number
}

export declare class ResizeHandler {
  constructor(el: Element)
  el: Element
  lastCoordinates: unknown
  eventType: string
  lastEvent: unknown
  box: Box
  startPoint: Point
  index: number
  points: number[][]
  preserveAspectRatio: boolean
  aroundCenter: boolean
  grid: number
  degree: number
  active(value: boolean, options: ResizeOptions): void
  handleResize(e: CustomEvent): void
  resize(e: Event): void
  movePoint(e: Event): void
  rotate(e: Event): void
  endResize(e: Event): void
  snapToGrid<T extends { x: number; y: number }>(point: T): T
  snapToAngle(angle: number): number
}

declare module '@svgdotjs/svg.js' {
  interface Element {
    resize(): this
    resize(enable: boolean): this
    resize(options: ResizeOptions): this
    resize(handler: ResizeHandler): this
    resize(attr?: ResizeHandler | ResizeOptions | boolean): this
  }
}
