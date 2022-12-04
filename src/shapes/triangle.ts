import { Vector } from "@/core/vector"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Triangle extends Shape {
  public override shapeTypeId = 2

  constructor(properties: ShapeProperties, start: Vector) {
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

    ctx.strokeStyle =
      this.isHovered || this.isSelected
        ? this.properties.hoverColor
        : this.properties.shapeColor
    ctx.lineWidth = this.properties.lineWidth
    ctx.stroke()

    ctx.fillStyle = this.properties.fillColorRgba
    ctx.fill()

    this.drawHoveredPoint(ctx)
    this.drawPointCoordinates(ctx)
  }

  public onMouseDown(coords: Vector): void {}

  public onMouseMove(coords: Vector): void {
    this.points[this.points.length - 1] = coords
  }

  private isFirstPointReleased = false
  public onMouseUp(coords: Vector): void {
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
