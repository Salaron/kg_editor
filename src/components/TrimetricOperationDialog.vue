<script setup lang="ts">
import CanvasComponent from "@/components/CanvasComponent.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import { Operations } from "@/core/operations"
import { ShapeManager } from "@/core/shapeManager"
import { ShapeProperties } from "@/core/shapeProperties"
import { Vector } from "@/core/vector"
import { Shape } from "@/shapes/shape"
import { deepClone } from "@/util/object"
import { ref, watch } from "vue"

const height = ref(innerHeight * 0.5)

const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const operationsCanvasComponent = ref<InstanceType<
  typeof CanvasComponent
> | null>(null)

const fAngle = ref(0)
const tAngle = ref(0)
const zDistance = ref(1000)

let shapeManager: ShapeManager | null = null
let previewShapes: Shape[] = []
let originalShapes: Shape[] = []
function drawPreview(context: CanvasRenderingContext2D) {
  previewShapes.forEach((shape) => {
    shape.draw(context)
  })
}

async function openOperationsDialog(
  canvasWidth: number,
  canvasHeight: number,
  shapes: Shape[]
) {
  dialog.value?.open()
  await operationsCanvasComponent.value?.waitMounted()
  const operationsCanvas = operationsCanvasComponent.value?.getCanvasElement()
  if (!operationsCanvas) return

  const scaleX = operationsCanvas.offsetWidth / canvasWidth
  const scaleY = height.value / canvasHeight

  originalShapes = deepClone(shapes)
  for (const shape of shapes) {
    shape.points = new Operations(shape.points)
      .scale(scaleX, scaleY, 1)
      .finish()
    shape.isSelected = false
  }
  previewShapes = deepClone(shapes).map((shape) => {
    shape.properties = new ShapeProperties(
      "#00ff00",
      shape.properties.lineWidth + 1,
      shape.properties.fillColorHex,
      shape.properties.alpha
    )
    return shape
  })
  shapeManager = new ShapeManager(operationsCanvas!.getContext("2d")!, {
    shapes,
    onUpdate: drawPreview,
  })

  operationsCanvasComponent.value?.initialize(shapeManager, true)
}

watch(
  [fAngle, tAngle, zDistance],
  () => {
    if (!shapeManager) return

    const shapesCopy = deepClone(shapeManager.shapes)
    previewShapes = applyOperations(shapesCopy)
    console.log(previewShapes)
  },
  { deep: true }
)

function multiplyVectorMatrix(row: number[], matrix: number[][]): number[] {
  let result: number[] = [];
  for (let i = 0; i < matrix[0].length; i++) {
    let sum = 0;
    for (let j = 0; j < row.length; j++) {
      sum += row[j] * matrix[j][i];
    }
    result.push(sum);
  }
  return result;
}


function applyOperations(shapes: Shape[]): Shape[] {
  return shapes.map((shape) => {
    const convertedPoints = new Operations(
      deepClone(shape.points)
    ).convertToScreen().finish()

    const f = (fAngle.value * Math.PI) / 180
    const t = (tAngle.value * Math.PI) / 180
    const z = parseInt(zDistance.value as unknown as string)
    console.log(z)
    const matrix = [
      [Math.cos(f), Math.sin(f) * Math.sin(f), 0, (Math.sin(f) * Math.cos(t)) / z],
      [0, Math.cos(t), 0, -Math.sin(t) / z],
      [Math.sin(f), -Math.cos(f) * Math.sin(t), 0, (Math.cos(f) * Math.cos(t)) / z],
      [0, 0, 0, 1]
    ]

    for (let i = 0; i < convertedPoints.length; i++) {
      const aaa = multiplyVectorMatrix([...convertedPoints[i].toArray(), 1], matrix)
      convertedPoints[i] = new Vector(aaa[0] / aaa[3], aaa[1] / aaa[3], aaa[2] / aaa[3])
    }

    shape.properties = new ShapeProperties(
      "#00ff00",
      shape.properties.lineWidth + 1,
      shape.properties.fillColorHex,
      shape.properties.alpha
    )
    shape.points = new Operations(convertedPoints)
      .convertToSystem()
      .round()
      .finish()
    return shape
  })
}

function dispose() {
  previewShapes = []
  originalShapes = []
  shapeManager?.dispose()
  shapeManager = null
}

const emit = defineEmits(["trimetricDialogClosed"])
function onSave() {
  const result = applyOperations(originalShapes)
  console.log(result)
  emit("trimetricDialogClosed", result)
  dispose()
  dialog.value?.close()
}

function onCancel() {
  dialog.value?.close()
}


defineExpose({ openOperationsDialog })
</script>

<template>
  <ModalDialog ref="dialog" :on-save="onSave" :on-cancel="onCancel" :full-width="true">
    <template #title> Операции </template>
    <template #body>
      <CanvasComponent ref="operationsCanvasComponent" :style="{ height: height + 'px' }" />

      <label class="block mb-2 text-base font-medium text-gray-900"></label>
      <input v-model="fAngle" type="range" min="0" max="360" />

      <label class="block mb-2 text-base font-medium text-gray-900"></label>
      <input v-model="tAngle" type="range" min="0" max="360" />

      <label class="block mb-2 text-base font-medium text-gray-900"></label>
      <input v-model="zDistance" type="text" />
    </template>
  </ModalDialog>
</template>

<style scoped>
input {
  border-color: black;
  border-width: 1px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}

.list-group-item i {
  cursor: pointer;
}
</style>
