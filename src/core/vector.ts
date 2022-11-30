import { ProjectionMode } from "./projectionMode"
import { ShapeManager } from "./shapeManager"

export class Vector {
  public purePoints: number[] = []

  constructor(x: number, y: number, z: number = 0, purePoints: number[] = []) {
    if (purePoints.length === 0) {
      if (ShapeManager.projectionMode == ProjectionMode.XY) {
        this.purePoints = [x, y, z]
      }
      if (ShapeManager.projectionMode == ProjectionMode.XZ) {
        this.purePoints = [x, z, y]
      }
      if (ShapeManager.projectionMode == ProjectionMode.YZ) {
        this.purePoints = [y, z, x]
      }
    } else {
      this.purePoints = purePoints
    }
  }

  public get x() {
    if (ShapeManager.projectionMode == ProjectionMode.YZ)
      return this.purePoints[1]

    return this.purePoints[0]
  }

  public set x(value: number) {
    if (ShapeManager.projectionMode == ProjectionMode.YZ)
      this.purePoints[1] = value
    else
      this.purePoints[0] = value
  }

  public get y() {
    if (ShapeManager.projectionMode != ProjectionMode.XY)
      return this.purePoints[2]
    return this.purePoints[1]
  }

  public set y(value: number) {
    if (ShapeManager.projectionMode != ProjectionMode.XY)
      this.purePoints[2] = value
    else
      this.purePoints[1] = value
  }

  public get z() {
    if (ShapeManager.projectionMode == ProjectionMode.XY)
      return this.purePoints[2]
    return this.purePoints[1]
  }

  public set z(value: number) {
    if (ShapeManager.projectionMode == ProjectionMode.XY)
      this.purePoints[2] = value
    if (ShapeManager.projectionMode == ProjectionMode.XZ)
      this.purePoints[1] = value
  }


  public convertToScreen() {
    if (ShapeManager.projectionMode == ProjectionMode.XY) {
      return new Vector(this.purePoints[0], this.purePoints[1] * -1, this.purePoints[2])
    }
    if (ShapeManager.projectionMode == ProjectionMode.XZ) {
      return new Vector(this.purePoints[0], this.purePoints[1] * -1, this.purePoints[2])
    }
    return new Vector(this.purePoints[0], this.purePoints[1] * -1, this.purePoints[2])
  }

  public convertToSystem() {
    return this.convertToScreen()
  }

  public toString() {
    return `(${this.purePoints[0]}, ${this.purePoints[1]}, ${this.purePoints[2]})`
  }

  public distance(anotherPoint: Vector) {
    return Math.sqrt(Math.pow(anotherPoint.x - this.x, 2) + Math.pow(anotherPoint.y - this.y, 2))
  }
}
