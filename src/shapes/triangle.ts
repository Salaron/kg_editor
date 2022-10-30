import { Vector2 } from "@/core/vector2"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Triangle extends Shape {
  constructor(properties: ShapeProperties, start: Vector2) {
    super(properties)
    this.points.push(start)
    this.points.push(start)
    this.isDrawingFinished = false
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (const point of this.points.slice(1)) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.closePath()

    ctx.strokeStyle = this.IsHovered || this.isSelected ? this.properties.hoverColor : this.properties.shapeColor
    ctx.lineWidth = this.properties.lineWidth
    ctx.stroke()

    ctx.fillStyle = this.properties.fillColorRgba
    ctx.fill()
  }

  public onMouseDown(coords: Vector2): void {}

  public onMouseMove(coords: Vector2): void {
    this.points[this.points.length - 1] = coords
  }

  private isFirstPointReleased = false
  public onMouseUp(coords: Vector2): void {
    if (this.isFirstPointReleased === false) {
      this.isFirstPointReleased = true
      return
    }
    this.points.push(coords)
    this.isDrawingFinished = this.points.length === 4
    if (this.isDrawingFinished) {
      this.points.pop()
    }
  }
}
