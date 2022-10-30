import { Vector2 } from "@/core/vector2"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "./shape"

export class Polygon extends Shape {
  constructor(properties: ShapeProperties, start: Vector2, end?: Vector2) {
    super(properties)
    this.points.push(start)
    this.points.push(start)
  }

  public createSpline(points: Vector2[]) {
    this.points = []
    this.isDrawingFinished = true
    this.showPointCoordinages = false
    for (let i = 0; i < points.length; i++) {
      var a0x =
        (points[i % points.length].x
          + 4 * points[(i + 1) % points.length].x
          + points[(i + 2) % points.length].x) / 6;
      var a1x =
        (-points[i % points.length].x
          + points[(i + 2) % points.length].x) / 2;
      var a2x =
        (points[i % points.length].x
          - 2 * points[(i + 1) % points.length].x
          + points[(i + 2) % points.length].x) / 2;
      var a3x =
        (-points[i % points.length].x
          + 3 * points[(i + 1) % points.length].x
          - 3 * points[(i + 2) % points.length].x
          + points[(i + 3) % points.length].x) / 6;

      var a0y =
        (points[i % points.length].y
          + 4 * points[(i + 1) % points.length].y
          + points[(i + 2) % points.length].y) / 6;
      var a1y =
        (-points[i % points.length].y
          + points[(i + 2) % points.length].y) / 2;
      var a2y =
        (points[i % points.length].y
          - 2 * points[(i + 1) % points.length].y
          + points[(i + 2) % points.length].y) / 2;
      var a3y =
        (-points[i % points.length].y
          + 3 * points[(i + 1) % points.length].y
          - 3 * points[(i + 2) % points.length].y
          + points[(i + 3) % points.length].y) / 6;

      for (let t = 0; t < 1; t += 0.05) {
        this.points.push(new Vector2(
          ((a3x * t + a2x) * t + a1x) * t + a0x,
          ((a3y * t + a2y) * t + a1y) * t + a0y,
        ))
      }
    }
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

  public override isHovered(coord: Vector2): boolean {
    return super.isHovered(coord)
  }

  public onMouseDown(coords: Vector2): void {
    this.points.push(coords)
  }

  public onMouseMove(coords: Vector2): void {
    this.points[this.points.length - 1] = coords
  }

  public onMouseUp(coords: Vector2): void {
    this.points[this.points.length - 1] = coords
  }
}
