import { Vector } from "@/core/vector"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Rectangle extends Shape {
  constructor(properties: ShapeProperties, start: Vector, end?: Vector) {
    super(properties)
    this.updatePoints(start, end ?? start)
    this.isDrawingFinished = false
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    for (const point of this.points.slice(1)) {
      ctx.lineTo(point.x, point.y)
    }
    ctx.closePath()

    ctx.strokeStyle = this.isHovered || this.isSelected ? this.properties.hoverColor : this.properties.shapeColor
    ctx.lineWidth = this.properties.lineWidth
    ctx.stroke()

    ctx.fillStyle = this.properties.fillColorRgba
    ctx.fill()

    this.drawHoveredPoint(ctx)
    this.drawPointCoordinates(ctx)
  }

  public onMouseDown(coords: Vector): void {
    this.updatePoints(this.points[0], coords)
    this.isDrawingFinished = true
  }

  public onMouseMove(coords: Vector): void {
    this.updatePoints(this.points[0], coords)
  }

  public onMouseUp(coords: Vector): void { }

  private updatePoints(start: Vector, end: Vector) {
    this.points = [start, new Vector(end.x, start.y), end, new Vector(start.x, end.y)]
  }
}
