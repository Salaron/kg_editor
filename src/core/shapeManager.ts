import { Line } from "@/shapes/line"
import { Rectangle } from "@/shapes/rectangle"
import { Shape } from "@/shapes/shape"
import { deepClone } from "@/util/object"
import { uuidv4 } from "@/util/uuid"
import { EditorMode } from "./editorMode"
import { defaultShapeProperties, ShapeProperties } from "./shapeProperties"
import { Vector2 } from "./vector2"

export type ShapeManagerOptions = {
  noGrid?: boolean
  shapes?: Shape[]
  onUpdate?: (context: CanvasRenderingContext2D) => void
  onStatusMouseMove?: (mouseCoords: Vector2) => void
  onShapeSelectedStatus?: (shapeSelected: boolean) => void
  onShapePropertiesChanged?: (properties: ShapeProperties) => void
  onPointChanged?: (points: Vector2[][]) => void
}

export class ShapeManager {
  public shapes: Shape[] = []
  public focusedShapes = new Set<Shape>()

  public drawingShapeType: typeof Shape = Line
  public drawingShape: Shape | null = null
  public workingMode = EditorMode.Drawing
  public canvasWidth!: number
  public canvasHeight!: number

  private context: CanvasRenderingContext2D
  private defaultProperties = defaultShapeProperties
  private options: ShapeManagerOptions
  private disposed = false

  constructor(ctx: CanvasRenderingContext2D, options: ShapeManagerOptions = {}) {
    this.context = ctx
    this.shapes = options.shapes ?? []
    this.options = options
    this.updateSize()
  }

  public changeShapeProperties(newProperties: ShapeProperties) {
    if (this.focusedShapes.size === 0)
      this.defaultProperties = deepClone(newProperties)

    for (const shape of this.focusedShapes) {
      const idx = this.shapes.findIndex((other) => shape.shapeId === other.shapeId)
      this.shapes[idx].properties = deepClone(newProperties)
    }
  }

  public dispose() {
    this.disposed = true
    this.shapes = []
    this.focusedShapes.clear()
  }

  public clear() {
    this.shapes = []
    this.drawingShape = null
  }

  public updateSize() {
    if (!this.context) {
      return
    }
    this.context.canvas.width = this.context.canvas.offsetWidth
    this.context.canvas.height = this.context.canvas.offsetHeight

    this.canvasWidth = this.context.canvas.width
    this.canvasHeight = this.context.canvas.height
    this.context.translate(this.canvasWidth / 2, this.canvasHeight / 2);
  }

  private lastTime = Date.now()
  private lastFocusedJson = ""
  public update() {
    if (!this.disposed)
      requestAnimationFrame(() => this.update())

    const now = Date.now();
    const elapsed = now - this.lastTime;

    // if enough time has elapsed, draw the next frame
    if (elapsed > 1000 / 75) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      this.lastTime = now - (elapsed % (1000 / 75));

      this.context.clearRect(-this.canvasWidth, -this.canvasHeight, this.canvasWidth * 2, this.canvasHeight * 2)

      this.shapes.map((shape) => {
        shape.draw(this.context)
        shape.drawHoveredPoint(this.context)
        shape.drawPointAnnotation(this.context)
      })
      if (this.drawingShape) {
        this.drawingShape.draw(this.context)
        this.drawingShape.drawPointAnnotation(this.context)
      }

      if (this.options.onUpdate)
        this.options.onUpdate(this.context)

      if (!this.options.noGrid)
        this.drawGrid()

      if (this.options.onPointChanged) {
        if (JSON.stringify([...this.focusedShapes]) !== this.lastFocusedJson) {
          let points = []
          for (const shape of [...this.focusedShapes]) {
            points.push(shape.points)
          }
          this.options.onPointChanged(points)
          this.lastFocusedJson = JSON.stringify([...this.focusedShapes])
        }
      }
    }
  }

  public onMouseAction(event: MouseEvent, actionType: number) {
    const boundingRect = this.context.canvas.getBoundingClientRect()
    const coords = new Vector2(event.clientX - boundingRect.left - this.canvasWidth / 2, event.clientY - boundingRect.top - this.canvasHeight / 2)

    switch (actionType) {
      case 0:
        this.onMouseMove(coords)
        break
      case 1:
        this.onMouseDown(coords, event.button, event.ctrlKey, event.shiftKey)
        break
      case 2:
        this.onMouseUp(coords, event.button)
        break
    }
  }

  public onMouseMove(mouseCoords: Vector2) {
    this.shapes.map((shape) => {
      shape.isHovered(mouseCoords)
    })
    if (this.drawingShape) {
      this.drawingShape.onMouseMove(mouseCoords)
    }

    if (this.workingMode === EditorMode.Selecting) {
      for (const focusedShape of this.focusedShapes) {
        focusedShape.move(mouseCoords)
      }

      if (this.drawingShape)
        this.drawingShape.onMouseMove(mouseCoords)
    }

    if (this.options.onStatusMouseMove)
      this.options.onStatusMouseMove(mouseCoords.convertToScreen())
  }

  public onMouseDown(mouseCoords: Vector2, buttonCode: number, ctrl = false, shift = false) {
    if (shift === false) {
      for (const shape of this.shapes) {
        shape.isSelected = false
      }
      this.focusedShapes.clear()
    }

    if (this.workingMode === EditorMode.Drawing) {
      if (this.drawingShape === null) {
        // @ts-ignore
        this.drawingShape = new this.drawingShapeType(this.defaultProperties, mouseCoords)
      } else {
        if (this.drawingShape && buttonCode === 2) {
          this.drawingShape.isDrawingFinished = true
        }
        this.drawingShape.onMouseDown(mouseCoords)
      }
    }

    if (this.workingMode === EditorMode.Selecting) {
      this.shapes.map((shape) => {
        const hovered = shape.isPointOnLine(mouseCoords) || shape.isHovered(mouseCoords)
        if (hovered) {
          this.focusedShapes.add(shape)
          shape.isSelected = true
        }
      })

      if (ctrl === true) {
        const clonedShapes = deepClone([...this.focusedShapes])
        const newShapes = clonedShapes.map(shape => {
          shape.shapeId = uuidv4()
          this.shapes.push(shape)
          return shape
        })
        this.focusedShapes.clear()
        newShapes.forEach(shape => {
          this.focusedShapes.add(shape)
        });
      }

      this.focusedShapes.forEach(shape => shape.beginMove(mouseCoords))

      if (this.focusedShapes.size === 0) {
        const selectProps = new ShapeProperties("#0000ff", 2, "#0000ff", "0.5")
        this.drawingShape = new Rectangle(selectProps, mouseCoords)
      }
        
      if (this.options.onShapeSelectedStatus)
        this.options.onShapeSelectedStatus(this.focusedShapes.size !== 0)

      let properties = this.defaultProperties
      if (this.focusedShapes.size > 0)
        properties = [...this.focusedShapes][0].properties

      if (this.options.onShapePropertiesChanged)
        this.options.onShapePropertiesChanged(deepClone(properties))
    }
  }

  public onMouseUp(mouseCoords: Vector2, buttonCode: number) {
    if (this.workingMode === EditorMode.Drawing) {
      this.drawingShape?.onMouseUp(mouseCoords)
      if (this.drawingShape?.isDrawingFinished === true) {
        this.shapes.push(this.drawingShape)
        this.drawingShape = null
      }
    }

    if (this.workingMode === EditorMode.Selecting) {
      this.drawingShape = null

      this.focusedShapes.forEach(shape => {
        shape.endMove()
      })
    }
  }

  private drawGrid() {
    const props = new ShapeProperties("#000000", 2, "rgba(0, 0, 0, 0)")

    const lineY = new Line(
      props,
      new Vector2(0, this.canvasHeight / 2),
      new Vector2(0, -this.canvasHeight / 2)
    )
    lineY.drawWithArrow(this.context)
    this.context.fillStyle = "#000000"
    this.context.font = "24px serif"
    this.context.fillText("Y", 7, -this.canvasHeight / 2 + 30)

    const lineX = new Line(
      props,
      new Vector2(-this.canvasWidth / 2, 0),
      new Vector2(this.canvasWidth / 2, 0)
    )
    lineX.drawWithArrow(this.context)
    this.context.fillText("X", this.canvasWidth / 2 - 35, 23)
  }
}
