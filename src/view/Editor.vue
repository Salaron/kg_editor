<script setup lang="ts">
import CanvasComponent from "@/components/CanvasComponent.vue"
import FractalTreeDialog from "@/components/FractalTreeDialog.vue"
import MorphingDialog from "@/components/MorphingDialog.vue"
import OperationsDialog from "@/components/OperationsDialog.vue"
import PropertiesSidebar from "@/components/PropertiesSidebar.vue"
import StatusBar from "@/components/StatusBar.vue"
import ToolBar from "@/components/ToolBar.vue"
import ThreeJsPortal from "@/components/ThreeJsPortal.vue"
import { EditorMode } from "@/core/editorMode"
import { ShapeManager } from "@/core/shapeManager"
import { ShapeProperties } from "@/core/shapeProperties"
import { Vector } from "@/core/vector"
import { Polygon } from "@/shapes/polygon"
import { Shape } from "@/shapes/shape"
import { deepClone } from "@/util/object"
import { onMounted, Ref, ref } from "vue"

const height = ref(innerHeight * 0.9)

const mainCanvasComponent = ref<InstanceType<typeof CanvasComponent> | null>(null)

const statusBarComponent = ref<InstanceType<typeof StatusBar> | null>(null)
const propertiesComponent = ref<InstanceType<typeof PropertiesSidebar> | null>(null)
const operationsDialogComponent = ref<InstanceType<typeof OperationsDialog> | null>(null)
const fractalTreeDialogComponent = ref<InstanceType<typeof FractalTreeDialog> | null>(null)
const morphingDialogComponent = ref<InstanceType<typeof MorphingDialog> | null>(null)
const threeJsPortalComponent: Ref<InstanceType<typeof ThreeJsPortal> | null> = ref(null)


let shapeManager: ShapeManager | null = null
onMounted(() => {
  if (!mainCanvasComponent.value || !statusBarComponent.value)
    return

  const canvas = mainCanvasComponent.value?.getCanvasElement()
  shapeManager = new ShapeManager(canvas?.getContext("2d")!, {
    onStatusMouseMove: statusBarComponent.value.update,
    onShapePropertiesChanged: propertiesComponent.value?.updateShapeProperty,
    onShapeSelectedStatus: propertiesComponent.value?.updateShapeSelectedStatus,
    onPointChanged: propertiesComponent.value?.updateShapePoints
  })
  mainCanvasComponent.value?.initialize(shapeManager)
})


function clearCanvas() {
  shapeManager?.clear()
}

function onModeChange(mode: EditorMode) {
  if (!shapeManager)
    return

  shapeManager.workingMode = mode
}

function onToolChange(tool: typeof Shape) {
  if (!shapeManager)
    return

  shapeManager.drawingShapeType = tool
}

function shapePropertiesChanged(newProps: ShapeProperties) {
  if (!shapeManager)
    return

  shapeManager.changeShapeProperties(newProps)
}

function removeSelected() {
  if (!shapeManager)
    return

  shapeManager.shapes = shapeManager.shapes.filter(shape => {
    return !shapeManager?.focusedShapes.has(shape)
  })
  propertiesComponent.value?.updateShapeSelectedStatus(false)
}

function createSpline() {
  if (!shapeManager)
    return

  const baseShape = [...shapeManager.focusedShapes][0]

  const splinePolygon = new Polygon(new ShapeProperties("#ff00ff", baseShape.properties.lineWidth, "#000000", "1"), new Vector(0, 0))
  splinePolygon.createSpline(baseShape.points)

  shapeManager.shapes.push(splinePolygon)
}

async function openOperationsDialog() {
  if (!operationsDialogComponent.value || !shapeManager || !mainCanvasComponent.value)
    return

  const canvasElement = mainCanvasComponent.value.getCanvasElement()
  const shapesCopy = deepClone([...shapeManager.focusedShapes])
  await operationsDialogComponent.value.openOperationsDialog(canvasElement.offsetWidth, height.value, shapesCopy)
}
function operationDialogClosed(previewShapes: Shape[]) {
  if (!shapeManager)
    return;

  const newShapes = [...shapeManager.focusedShapes].map((shape, index) => {
    shape.points = deepClone(previewShapes[index].points)
    return shape
  })

  shapeManager.focusedShapes = new Set(newShapes)
}

async function openFractalTreeDialog() {
  if (!fractalTreeDialogComponent.value)
    return

  await fractalTreeDialogComponent.value.openFractalTreeDialog()
}

async function openMorphingDialog() {
  if (!morphingDialogComponent.value || !shapeManager || !mainCanvasComponent.value)
    return

  const canvasElement = mainCanvasComponent.value.getCanvasElement()
  const shapesCopy = deepClone([...shapeManager.focusedShapes])

  await morphingDialogComponent.value.openMorphingDialog(canvasElement.offsetWidth, height.value, shapesCopy[0], shapesCopy[1])
}

function morphingDialogClosed(morphingShape: Shape) {
  if (!shapeManager)
    return

  shapeManager.shapes.push(morphingShape)
}

// remove text selection on double click
document.addEventListener("mousedown", function (event) {
  if (event.detail > 1) {
    event.preventDefault()
  }
})


function toggle3d(state: boolean) {
  if (!threeJsPortalComponent.value || !shapeManager)
    return

  if (state) {
    threeJsPortalComponent!.value.openPortal(shapeManager)
  } else {
    threeJsPortalComponent!.value.closePortal()
  }
}
</script>

<template>
  <ThreeJsPortal ref="threeJsPortalComponent" />
  <OperationsDialog ref="operationsDialogComponent" @operation-dialog-closed="operationDialogClosed" />
  <FractalTreeDialog ref="fractalTreeDialogComponent" />
  <MorphingDialog ref="morphingDialogComponent" @morphing-dialog-closed="morphingDialogClosed" />


  <div class="mainContainer pl-2 pr-2">
    <ToolBar @clear-canvas="clearCanvas" @on-mode-change="onModeChange" @on-tool-change="onToolChange" />
    <div class="editor" :style="{ height: height + 'px' }">
      <CanvasComponent ref="mainCanvasComponent" />
      <PropertiesSidebar ref="propertiesComponent" @open-operations="openOperationsDialog"
        @open-fractal-tree="openFractalTreeDialog" @shape-properties-changed="shapePropertiesChanged"
        @remove-selected="removeSelected" @create-spline="createSpline" @morphing="openMorphingDialog"
        @toggle3d="toggle3d" />
    </div>

    <StatusBar ref="statusBarComponent" />
  </div>
</template>

<style>
.canvas {
  width: 100%;
}

.editor {
  display: flex;
  flex-direction: row;
}
</style>