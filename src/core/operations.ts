import { Vector2 } from "./vector2"


export class Operations {
  public points: Vector2[]

  constructor(basePoints: Vector2[]) {
    this.points = basePoints
  }

  public convertToScreen(): Operations {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = this.points[i].convertToScreen()
    }

    return this
  }

  public convertToSystem(): Operations {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = this.points[i].convertToSystem()
    }

    return this
  }

  public round() {
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].x = Math.round(this.points[i].x)
      this.points[i].y = Math.round(this.points[i].y)
    }

    return this
  }

  public finish() {
    return this.points
  }

  public morphing(points2: Vector2[], value: number): Operations {
    if (this.points.length != points2.length)
      throw new Error("Invalid count of points")

    for (let i = 0; i < this.points.length; i++) {
      const point1 = this.points[i]
      const point2 = points2[i]

      const x = (1 - value) * point1.x + value * point2.x
      const y = (1 - value) * point1.y + value * point2.y

      this.points[i] = new Vector2(x, y)
    }

    return this
  }

  public rotate(angleInDegrees: number): Operations {
    const angleInRadians = angleInDegrees * Math.PI / 180
    const cos = Math.cos(angleInRadians)
    const sin = Math.sin(angleInRadians)

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x * cos - point.y * sin
      const y = point.x * sin + point.y * cos

      this.points[i] = new Vector2(x, y)
    }

    return this
  }

  public scale(scaleX: number, scaleY: number): Operations {

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x * scaleX
      const y = point.y * scaleY

      this.points[i] = new Vector2(x, y)
    }

    return this
  }

  public transfer(transferX: number, transferY: number): Operations {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x + transferX
      const y = point.y + transferY

      this.points[i] = new Vector2(x, y)
    }

    return this
  }

  public mirror(mirrorX: boolean, mirrorY: boolean) {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x * (mirrorX ? -1: 1)
      const y = point.y * (mirrorY ? -1: 1)
      
      this.points[i] = new Vector2(x, y)
    }

    return this
  }
}

