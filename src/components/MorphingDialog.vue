<script setup lang="ts">
import CanvasComponent from "@/components/CanvasComponent.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import { Operations } from "@/core/operations"
import { ShapeManager } from "@/core/shapeManager"
import { ShapeProperties } from "@/core/shapeProperties"
import { Vector2 } from "@/core/vector2"
import { Shape } from "@/shapes/shape"
import { deepClone } from "@/util/object"
import { ref, watch } from "vue"

const height = ref(innerHeight * 0.5)

const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const morphingCanvasComponent = ref<InstanceType<typeof CanvasComponent> | null>(null)

let morphing = ref("0")
let shapeManager: ShapeManager | null = null
let morphingShape: Shape | null = null
let basePointsO: Vector2[] = []
let destPointsO: Vector2[] = []
let basePoints: Vector2[] = []
let destinationPoints: Vector2[] = []
function drawMorphingShape(context: CanvasRenderingContext2D) {
  if (!shapeManager || !morphingShape)
    return

  morphingShape.draw(context)
}

async function openMorphingDialog(canvasWidth: number, canvasHeight: number, shapeFrom: Shape, shapeTo: Shape) {
  dialog.value?.open()
  morphing.value = "0"
  await morphingCanvasComponent.value?.waitMounted()
  const morphingCanvas = morphingCanvasComponent.value?.getCanvasElement()
  if (!morphingCanvas)
    return

  basePointsO = deepClone(shapeFrom.points)
  destPointsO = deepClone(shapeTo.points)

  const scaleX = morphingCanvas.offsetWidth / canvasWidth
  const scaleY = height.value / canvasHeight
  for (const shape of [shapeFrom, shapeTo]) {
    shape.points = new Operations(shape.points).scale(scaleX, scaleY).finish()
    shape.isSelected = false
  }

  morphingShape = deepClone(shapeFrom)
  morphingShape.properties = new ShapeProperties("#00FF00", shapeFrom.properties.lineWidth, shapeFrom.properties.fillColorHex, shapeFrom.properties.alpha)
  basePoints = deepClone(shapeFrom.points)
  destinationPoints = deepClone(shapeTo.points)

  shapeManager = new ShapeManager(morphingCanvas?.getContext("2d")!, {
    onUpdate: drawMorphingShape,
    shapes: [shapeFrom, shapeTo]
  })

  morphingCanvasComponent.value?.initialize(shapeManager, true)
}

const emit = defineEmits(["morphingDialogClosed"])

function onSave() {
  if (!morphingShape)
    return

  const resultShape = deepClone(morphingShape)
  resultShape.points = new Operations(basePointsO).morphing(destPointsO, parseFloat(morphing.value)).round().finish()

  emit('morphingDialogClosed', resultShape)
  dispose()
  dialog.value?.close()
}

function dispose() {
  shapeManager?.dispose()
  shapeManager = null
  morphingShape = null
  dialog.value?.close()
}

watch(morphing, value => {
  if (!morphingShape)
    return;

  morphingShape.points = new Operations(deepClone(basePoints)).morphing(destinationPoints, parseFloat(value)).finish()
})

defineExpose({ openMorphingDialog })
</script>

<template>
  <ModalDialog ref="dialog" :on-save="onSave" :on-cancel="dispose" :full-width="true">
    <template #title> Морфинг </template>
    <template #body>
      <CanvasComponent ref="morphingCanvasComponent" :style="{ height: height + 'px' }" />

      <label>Морфинг</label>
      <input type="range" min="0" max="1" step="0.01" class="ml-2" v-model="morphing" />
    </template>
  </ModalDialog>
</template>