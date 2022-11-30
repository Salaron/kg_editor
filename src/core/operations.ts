import { Vector } from "./vector"


export class Operations {
  public points: Vector[]

  constructor(basePoints: Vector[]) {
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
      for (let j = 0; j < this.points[i].purePoints.length; j++) {
        this.points[i].purePoints[j] = Math.round(this.points[i].purePoints[j])
      }
    }

    return this
  }

  public finish() {
    return this.points
  }

  public morphing(points2: Vector[], value: number): Operations {
    if (this.points.length != points2.length)
      throw new Error("Invalid count of points")

    for (let i = 0; i < this.points.length; i++) {
      const point1 = this.points[i]
      const point2 = points2[i]

      const x = (1 - value) * point1.purePoints[0] + value * point2.purePoints[0]
      const y = (1 - value) * point1.purePoints[1] + value * point2.purePoints[1]
      const z = (1 - value) * point1.purePoints[2] + value * point2.purePoints[2]

      this.points[i] = new Vector(0, 0, 0, [x, y, z])
    }

    return this
  }

  public rotateX(angleInDegrees: number): Operations {
    const angleInRadians = angleInDegrees * Math.PI / 180
    const cos = Math.cos(angleInRadians)
    const sin = Math.sin(angleInRadians)

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const y = point.purePoints[1] * cos - point.purePoints[2] * sin
      const z = point.purePoints[1] * sin + point.purePoints[2] * cos

      this.points[i] = new Vector(0, 0, 0, [point.purePoints[0], y, z])
    }

    return this
  }

  public rotateY(angleInDegrees: number): Operations {
    const angleInRadians = angleInDegrees * Math.PI / 180
    const cos = Math.cos(angleInRadians)
    const sin = Math.sin(angleInRadians)

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.purePoints[0] * cos -  point.purePoints[2] * sin
      const z = point.purePoints[0] * -sin + point.purePoints[2] * cos

      this.points[i] = new Vector(0, 0, 0, [x, point.purePoints[1], z])
    }

    return this
  }

  public rotateZ(angleInDegrees: number): Operations {
    const angleInRadians = angleInDegrees * Math.PI / 180
    const cos = Math.cos(angleInRadians)
    const sin = Math.sin(angleInRadians)

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x * cos - point.y * sin
      const y = point.x * sin + point.y * cos

      this.points[i] = new Vector(0, 0, 0, [x, y, point.purePoints[2]])
    }

    return this
  }

  public scale(scaleX: number, scaleY: number, scaleZ: number): Operations {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.purePoints[0] * scaleX
      const y = point.purePoints[1] * scaleY
      const z = point.purePoints[2] * scaleZ

      this.points[i] = new Vector(0, 0, 0, [x, y, z])
    }

    return this
  }

  public transfer(transferX: number, transferY: number, transferZ: number): Operations {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.purePoints[0] + transferX
      const y = point.purePoints[1] + transferY
      const z = point.purePoints[2] + transferZ
      this.points[i] = new Vector(0, 0, 0, [x, y, z])
    }

    return this
  }

  public mirror(mirrorX: boolean, mirrorY: boolean, mirrorZ: boolean) {
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i]

      const x = point.x * (mirrorX ? -1: 1)
      const y = point.y * (mirrorY ? -1: 1)
      
      this.points[i] = new Vector(0, 0, 0, [x, y, point.purePoints[2]])
    }

    return this
  }
}

