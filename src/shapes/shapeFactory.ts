import { defaultShapeProperties, ShapeProperties } from "@/core/shapeProperties"
import { Vector } from "@/core/vector"
import { Shape } from "./shape"
import { Line } from "./line"
import { Polygon } from "./polygon"
import { Rectangle } from "./rectangle"
import { Triangle } from "./triangle"

export class ShapeFactory {
  public static create(data: any) {
    let result: Shape | null = null

    switch (data.shapeTypeId) {
      case 1:
        result = new Line(defaultShapeProperties)
        break
      case 2:
        result = new Triangle(defaultShapeProperties, new Vector(0, 0))
        break
      case 3:
        result = new Rectangle(defaultShapeProperties, new Vector(0, 0))
        break
      case 4:
        result = new Polygon(defaultShapeProperties, new Vector(0, 0))
        break
    }

    result!.isDrawingFinished = true
    result!.properties = new ShapeProperties(
      data.properties.shapeColor,
      data.properties.lineWidth,
      data.properties._fillColorHex,
      data.properties.alpha
    )
    console.log(data.points)
    result!.points = data.points.map((pt: any) => {
      return new Vector(0, 0, 0, pt.purePoints)
    })

    return result
  }
}
