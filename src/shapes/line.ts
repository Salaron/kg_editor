import { Vector2 } from "@/core/vector2"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Line extends Shape {
  public override showLineEquation = true

  constructor(properties: ShapeProperties, start?: Vector2, end?: Vector2) {
    super(properties)
    this.points.push(start!)
    if (end) {
      this.points.push(end)
      this.isDrawingFinished = true
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2)
      return;

    ctx.beginPath()
    ctx.moveTo(this.points[0].x, this.points[0].y)
    ctx.lineTo(this.points[1].x, this.points[1].y)
    ctx.strokeStyle = this.isHovered || this.isSelected ? this.properties.hoverColor : this.properties.shapeColor
    ctx.lineWidth = this.properties.lineWidth
    ctx.stroke()
    ctx.closePath()

    this.drawHoveredPoint(ctx)
    this.drawPointCoordinates(ctx)
  }

  public drawWithArrow(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    const headlen = 15 // length of head in pixels
    const dx = this.points[1].x - this.points[0].x
    const dy = this.points[1].y - this.points[0].y
    const angle = Math.atan2(dy, dx)
    ctx.moveTo(this.points[0].x, this.points[0].y)
    ctx.lineTo(this.points[1].x, this.points[1].y)
    ctx.lineTo(
      this.points[1].x - headlen * Math.cos(angle - Math.PI / 6),
      this.points[1].y - headlen * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(this.points[1].x, this.points[1].y)
    ctx.lineTo(
      this.points[1].x - headlen * Math.cos(angle + Math.PI / 6),
      this.points[1].y - headlen * Math.sin(angle + Math.PI / 6)
    )

    ctx.strokeStyle = this.isHovered || this.isSelected ? this.properties.hoverColor : this.properties.shapeColor
    ctx.lineWidth = this.properties.lineWidth
    ctx.stroke()
    ctx.closePath()
  }

  public onMouseDown(coords: Vector2): void {
    this.points[1] = coords
    this.isDrawingFinished = true
  }

  public onMouseMove(coords: Vector2): void {
    this.points[1] = coords
  }

  public onMouseUp(coords: Vector2): void { }
}
