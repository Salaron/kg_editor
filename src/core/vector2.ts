export class Vector2 {
  public x: number
  public y: number
  public ok = 1

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public convertToScreen() {
    return new Vector2(this.x, this.y * -1)
  }

  public convertToSystem() {
    return new Vector2(this.x, this.y * -1)
  }

  public toArray(): number[] {
    return [this.x, this.y, this.ok]
  }

  public toString() {
    return `(${this.x}, ${this.y})`
  }

  public distance(anotherPoint: Vector2) {
    return Math.sqrt(Math.pow(anotherPoint.x - this.x, 2) + Math.pow(anotherPoint.y - this.y, 2))
  }
}
