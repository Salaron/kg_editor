export class ShapeProperties {
  public shapeColor: string
  public alpha!: string
  public lineWidth: number
  public hoverColor = "red"

  public _fillColorHex!: string

  constructor(shapeColor: string, lineWidth: number, fillColor: string, alpha?: string) {
    this.shapeColor = shapeColor
    this.lineWidth = lineWidth

    if (fillColor.indexOf("#") !== -1 && alpha) {
      this.fillColorHex = fillColor
      this.alpha = alpha
    } else {
      this.fillColorRgba = fillColor
    }
  }

  public createCopy() {
    return new ShapeProperties(this.shapeColor, this.lineWidth, this.fillColorHex, this.alpha)
  }

  public get fillColorRgba() {
    const color = this.hexToRgb(this._fillColorHex)!
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${1 - parseFloat(this.alpha)})`
  }

  public get fillColorHex() {
    return this._fillColorHex
  }

  public set fillColorRgba(rgba: string) {
    const r = /^rgba\(([\d]+)\, ([\d]+)\, ([\d]+)\, ([\d]+)\)$/i.exec(rgba)!
    const hex = "#" + this.componentToHex(r[1]) + this.componentToHex(r[2]) + this.componentToHex(r[3])
    this._fillColorHex = hex
    this.alpha = (parseInt(r[4]) / 255).toString()
  }

  public set fillColorHex(hex: string) {
    this._fillColorHex = hex
  }

  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null
  }

  private componentToHex(c: string) {
    const hex = parseInt(c).toString(16)
    return hex.length == 1 ? "0" + hex : hex
  }
}

export const defaultShapeProperties = new ShapeProperties("#0000ff", 1, "#00ffff", "1")
