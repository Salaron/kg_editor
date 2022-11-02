import { Vector2 } from "@/core/vector2"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Rectangle extends Shape {
  constructor(properties: ShapeProperties, start: Vector2, end?: Vector2) {
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

  public onMouseDown(coords: Vector2): void {
    this.updatePoints(this.points[0], coords)
    this.isDrawingFinished = true
  }

  public onMouseMove(coords: Vector2): void {
    this.updatePoints(this.points[0], coords)
  }

  public onMouseUp(coords: Vector2): void { }

  private updatePoints(start: Vector2, end: Vector2) {
    this.points = [start, new Vector2(end.x, start.y), end, new Vector2(start.x, end.y)]
  }
}
