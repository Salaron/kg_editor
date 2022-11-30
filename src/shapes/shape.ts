import { Vector } from "@/core/vector"
import { defaultShapeProperties, ShapeProperties } from "@/core/shapeProperties"
import { uuidv4 } from "@/util/uuid"
import { constructLineEquation } from "@/util/lineEquation"
import { Rectangle } from "./rectangle"

export abstract class Shape {
  public shapeId = uuidv4()
  public isDrawingFinished = false
  public points: Vector[] = []

  // выбрана ли эта фигура нажатием ЛКМ
  public isSelected = false
  // подсвечена ли фигура мышью
  public isHovered = false
  public isMoving = false

  public properties: ShapeProperties = defaultShapeProperties

  // нужно ли отрисовывать координаты точек
  public showPointCoordinates = true
  // нужно ли рисовать уравнение прямой(-ых) этой фигуры
  public showLineEquation = false

  // Точка, с которой движение начинается
  private startMovePoint: Vector | null = null
  // Номер точки, которую нужно перемещать (если -1, то все)
  private movePointIndex = -1
  // Координаты точек до перемещения
  private pointsBackup: Vector[] = []
  // точка, которую двигают
  private hoveredPointIndex = -1

  abstract draw(ctx: CanvasRenderingContext2D): void
  abstract onMouseDown(coords: Vector): void
  abstract onMouseMove(coords: Vector): void
  abstract onMouseUp(coords: Vector): void
  //abstract onMouseAction(action: number, coord: Coord2d): void;

  constructor(properties: ShapeProperties) {
    this.properties = properties
  }

  public isHoveredByPoint(mouseCords: Vector): boolean {
    this.hoveredPointIndex = this.getPointIndexByCoord(mouseCords)
    this.isHovered = this.isPointOnLine(mouseCords)
    return this.hoveredPointIndex !== -1
  }

  public isShapeInRectangle(rec: Rectangle) {
    const point1 = rec.points[0]
    const point2 = rec.points[2]

    for (const shapePoint of this.points) {
      if (point1.x < shapePoint.x && shapePoint.x < point2.x && point1.y < shapePoint.y && shapePoint.y < point2.y ||
          point2.x < shapePoint.x && shapePoint.x < point1.x && point2.y < shapePoint.y && shapePoint.y < point1.y
        )
        return true;
    }

    return false;
  }

  public isPointOnLine(point: Vector): boolean {
    for (let idx = 0; idx < this.points.length; idx++) {
      const lineStart = this.points[idx]
      const lineEnd = this.points[(idx + 1) % this.points.length]
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

  public beginMove(startPoint: Vector) {
    this.startMovePoint = startPoint
    this.pointsBackup = JSON.parse(JSON.stringify(this.points))
    this.movePointIndex = this.getPointIndexByCoord(startPoint)
    this.isMoving = true
  }

  public move(coord: Vector) {
    if (this.isMoving == false || this.startMovePoint === null) {
      return
    }
    if (this.movePointIndex == -1) {
      for (let i = 0; i < this.points.length; i++) {
        this.points[i] = new Vector(
          this.pointsBackup[i].x + coord.x - this.startMovePoint.x,
          this.pointsBackup[i].y + coord.y - this.startMovePoint.y
        )
      }
    } else {
      this.points[this.movePointIndex] = new Vector(
        this.pointsBackup[this.movePointIndex].x + coord.x - this.startMovePoint.x,
        this.pointsBackup[this.movePointIndex].y + coord.y - this.startMovePoint.y
      )
    }
  }

  public endMove() {
    this.isMoving = false
    this.startMovePoint === null
  }

  // Получение индекса точки по указаным координатам
  protected getPointIndexByCoord(coord: Vector) {
    for (let i = 0; i < this.points.length; i++) {
      const dist = this.points[i].distance(coord)
      if (dist < 5) {
        return i
      }
    }
    return -1
  }

  protected drawHoveredPoint(ctx: CanvasRenderingContext2D) {
    if (this.hoveredPointIndex !== -1) {
      const point = this.points[this.hoveredPointIndex]
      ctx.beginPath()
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, false)

      ctx.fillStyle = this.properties.hoverColor
      ctx.fill()
      ctx.closePath()
    }
  }

  protected drawPointCoordinates(ctx: CanvasRenderingContext2D) {
    if (!this.isHovered && !this.isSelected && this.isDrawingFinished || !this.showPointCoordinates)
      return

    for (const point of this.points) {
      if (point == null)
        return

      const convertedPoint = point.convertToScreen()
      ctx.fillStyle = "#000000"
      ctx.font = `${15 + 3 * this.properties.lineWidth}px serif`
      ctx.fillText(`(${convertedPoint.x}; ${convertedPoint.y})`, point.x, point.y)
    }

    if (this.showLineEquation) {
      for (let idx = 0; idx < this.points.length / 2; idx++) {
        const eq = constructLineEquation(
          this.points[idx].convertToScreen(),
          this.points[idx + 1].convertToScreen()
        )
        ctx.fillStyle = "#000000"
        ctx.font = `${15 + 3 * this.properties.lineWidth}px serif`
        ctx.fillText(
          eq,
          (this.points[idx].x + this.points[idx + 1].x) / 2,
          (this.points[idx].y + this.points[idx + 1].y) / 2
        )
      }
    }
  }
}
