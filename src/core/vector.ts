export class Vector {
  public x: number
  public y: number
  public z: number
  public ok = 1

  constructor(x: number, y: number, z: number = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  public convertToScreen() {
    return new Vector(this.x, this.y * -1, this.z)
  }

  public convertToSystem() {
    return new Vector(this.x, this.y * -1, this.z)
  }

  public toString() {
    return `(${this.x}, ${this.y}, ${this.z})`
  }

  public distance(anotherPoint: Vector) {
    return Math.sqrt(Math.pow(anotherPoint.x - this.x, 2) + Math.pow(anotherPoint.y - this.y, 2) + Math.pow(anotherPoint.z - this.z, 2))
  }
}
