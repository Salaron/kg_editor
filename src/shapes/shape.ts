import { Vector2 } from "@/core/vector2"
import { defaultShapeProperties, ShapeProperties } from "@/core/shapeProperties"
import { uuidv4 } from "@/util/uuid"
import { calculateLineEquation } from "@/util/lineEquation"

export abstract class Shape {
  public shapeId = uuidv4()
  public isDrawingFinished = false
  public points: Vector2[] = []

  // выбрана ли эта фигура нажатием ЛКМ
  public isSelected = false
  public isMoving = false
  // выбрана ли эта фигура фокусом мыши

  public properties: ShapeProperties = defaultShapeProperties
  protected IsHovered = false

  protected showPointCoordinages = true
  // нужно ли рисовать уравнение прямой(-ых) этой фигуры
  protected showLineEquation = false


  // Точка, с которой движение начинается
  private startMovePoint: Vector2 | null = null
  // Номер точки, которую нужно перемещать (если -1, то все)
  private movePointIndex = -1
  // Координаты точек до перемещения
  private pointsBackup: Vector2[] = []

  private HoveredPointIndex = -1

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract onMouseDown(coords: Vector2): void
  abstract onMouseMove(coords: Vector2): void
  abstract onMouseUp(coords: Vector2): void

  constructor(properties: ShapeProperties) {
    this.properties = properties
  }

  //abstract onMouseAction(action: number, coord: Coord2d): void;

  public drawPointAnnotation(ctx: CanvasRenderingContext2D) {
    if (!this.IsHovered && !this.isSelected && this.isDrawingFinished || !this.showPointCoordinages) {
      return
    }
    for (const point of this.points) {
      if (point == null)
        return;
      const convertedPoint = point.convertToScreen()
      ctx.fillStyle = "#000000"
      ctx.font = "24px serif"
      ctx.fillText(`(${convertedPoint.x}; ${convertedPoint.y})`, point.x, point.y)
    }

    if (this.points.length === 2 && this.showLineEquation) {
      for (let idx = 0; idx < this.points.length / 2; idx++) {
        const eq = calculateLineEquation(
          this.points[idx].convertToScreen(),
          this.points[idx + 1].convertToScreen()
        )
        ctx.fillStyle = "#000000"
        ctx.font = "24px serif"
        ctx.fillText(
          eq,
          (this.points[idx].x + this.points[idx + 1].x) / 2,
          (this.points[idx].y + this.points[idx + 1].y) / 2
        )
      }
    }
  }

  public isPointOnLine(point: Vector2): boolean {
    if (this.points.length % 2 === 1) {
      return false
    }

    for (let idx = 0; idx < this.points.length / 2; idx += 2) {
      const lineStart = this.points[idx]
      const lineEnd = this.points[idx + 1]
      const maxDelta = this.properties.lineWidth / 10 + 0.5

      const startToCoord = lineStart.distance(point)
      const endtoPoint = lineEnd.distance(point)
      const startToEnd = lineStart.distance(lineEnd)

      const isPointOnLine = Math.abs(startToCoord + endtoPoint - startToEnd) < maxDelta

      if (isPointOnLine)
        return true
    }

    return false
  }

  public isHovered(coord: Vector2): boolean {
    this.HoveredPointIndex = this.getPointIndexByCoord(coord)
    this.IsHovered = this.isPointOnLine(coord)
    return this.HoveredPointIndex !== -1
  }

  public drawHoveredPoint(ctx: CanvasRenderingContext2D) {
    if (this.HoveredPointIndex !== -1) {
      const point = this.points[this.HoveredPointIndex]
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false)

      ctx.fillStyle = this.properties.hoverColor
      ctx.fill()
      ctx.closePath()
    }
  }

  // Получение индекса точки по указаным координатам
  public getPointIndexByCoord(coord: Vector2) {
    for (let i = 0; i < this.points.length; i++) {
      const dist = this.points[i].distance(coord)
      if (dist < 5) {
        return i
      }
    }
    return -1
  }

  public beginMove(startPoint: Vector2) {
    this.startMovePoint = startPoint
    this.pointsBackup = JSON.parse(JSON.stringify(this.points))
    this.movePointIndex = this.getPointIndexByCoord(startPoint)
    this.isMoving = true
  }

  public move(coord: Vector2) {
    if (this.isMoving == false || this.startMovePoint === null) {
      return
    }
    if (this.movePointIndex == -1) {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i] = new Vector2(
          this.pointsBackup[i].x + coord.x - this.startMovePoint.x,
          this.pointsBackup[i].y + coord.y - this.startMovePoint.y
        )
      }
    } else {
      this.points[this.movePointIndex] = new Vector2(
        this.pointsBackup[this.movePointIndex].x + coord.x - this.startMovePoint.x,
        this.pointsBackup[this.movePointIndex].y + coord.y - this.startMovePoint.y
      )
    }
  }

  public endMove() {
    this.isMoving = false
    this.startMovePoint === null
  }
}
