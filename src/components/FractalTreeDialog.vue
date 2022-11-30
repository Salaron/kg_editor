<script setup lang="ts">
import Accordion from "@/components/Accordion.vue"
import CanvasComponent from "@/components/CanvasComponent.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import { ShapeManager } from "@/core/shapeManager"
import { defaultShapeProperties } from "@/core/shapeProperties"
import { Vector } from "@/core/vector"
import { Line } from "@/shapes/line"
import { deepClone } from "@/util/object"
import { ref, watch } from "vue"

const height = ref(innerHeight * 0.5)

const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const operationsCanvasComponent = ref<InstanceType<typeof CanvasComponent> | null>(null)

const treeParams = ref({
  deep: "10",
  angle: {
    first: "45",
    second: "30"
  },
  scale: {
    first: "0.9",
    second: "0.7"
  }
})

let shapeManager: ShapeManager | null = null
let fractalComponents: Line[] = []
let translated = false
function drawTree(context: CanvasRenderingContext2D) {
  if (!shapeManager)
    return

  if (!translated) {
    context.translate(-shapeManager.canvasWidth / 2, -shapeManager.canvasHeight / 2)
    translated = true
  }

  fractalComponents.forEach(line => {
    line.draw(context)
  })
}

async function openFractalTreeDialog() {
  translated = false
  dialog.value?.open()
  await operationsCanvasComponent.value?.waitMounted()
  const operationsCanvas = operationsCanvasComponent.value?.getCanvasElement()
  if (!operationsCanvas)
    return

  shapeManager = new ShapeManager(operationsCanvas?.getContext("2d")!, {
    onUpdate: drawTree,
    noGrid: true
  })

  operationsCanvasComponent.value?.initialize(shapeManager, true)

  init()
}

const emit = defineEmits(["fractalTreeDialogClosed"])

function onSave() {
  dispose()
  emit("fractalTreeDialogClosed")
  dialog.value?.close()
}

watch(treeParams, () => {
  init()
}, { deep: true })

let xMin = 99999
let xMax = 0
let yMin = 99999
let yMax = 0
function init() {
  if (!shapeManager)
    return
  fractalComponents = []
  xMin = 99999
  xMax = 0
  yMin = 99999
  yMax = 0

  addBranch(shapeManager.canvasWidth / 2, 0, Math.PI * 0.5, height.value * 0.9, parseInt(treeParams.value.deep))
  adjustToScreen()
}

function addBranch(x: number, y: number, direction: number, length: number, level: number) {
  let point1 = new Vector(x, y)
  x += length * Math.cos(direction)
  y -= length * Math.sin(direction)
  let point2 = new Vector(x, y)

  if (xMin > x) xMin = x
  if (xMax < x) xMax = x
  if (yMin > y) yMin = y
  if (yMax < y) yMax = y

  let props = deepClone(defaultShapeProperties)
  props.shapeColor = `hwb(${level * 50} 0% 10%)`
  let line = new Line(props, point1, point2)
  fractalComponents.push(line)

  if (level > 0) {
    addBranch(x, y, direction + parseInt(treeParams.value.angle.first) * Math.PI / 180, length * parseFloat(treeParams.value.scale.first), level - 1)
    addBranch(x, y, direction + parseInt(treeParams.value.angle.second) * -1 * Math.PI / 180, length * parseFloat(treeParams.value.scale.second), level - 1)
  }
}

function adjustToScreen() {
  if (!shapeManager)
    return;

  let x = shapeManager.canvasWidth / (xMax - xMin)
  let y = shapeManager.canvasHeight / (yMax - yMin)
  let scale = Math.min(x, y)

  for (const shape of fractalComponents) {
    for (const point of shape.points) {
      point.x = scale * (point.x - xMin)
      point.y = scale * (point.y - yMin)
    }
  }
}

function dispose() {
  fractalComponents = []
  shapeManager?.dispose()
  shapeManager = null
  dialog.value?.close()
}

defineExpose({ openFractalTreeDialog })
</script>

<template>
  <ModalDialog ref="dialog" :on-save="onSave" :on-cancel="dispose" :full-width="true" :only-ok-button="true">
    <template #title> Фрактальное дерево </template>
    <template #body>
      <CanvasComponent ref="operationsCanvasComponent" :style="{ height: height + 'px' }" />

      <Accordion class="header" :title="'Глубина'">
        <template #body>
          <label class="block mb-2 text-base font-medium text-gray-900">Глубина дерева</label>
          <input v-model="treeParams.deep" type="text" min="1" max="11"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </template>
      </Accordion>

      <Accordion class="header" :title="'Углы ветвей'">
        <template #body>
          <label class="block mb-2 text-base font-medium text-gray-900">Угол левой ветви</label>
          <input v-model="treeParams.angle.first" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">

          <label class="block mb-2 text-base font-medium text-gray-900">Угол правой ветви</label>
          <input v-model="treeParams.angle.second" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </template>
      </Accordion>

      <Accordion class="header" :title="'Скейлинг'">
        <template #body>
          <label class="block mb-2 text-base font-medium text-gray-900">Скейлинг левой ветви</label>
          <input v-model="treeParams.scale.first" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">

          <label class="block mb-2 text-base font-medium text-gray-900">Скейлинг правой ветви</label>
          <input v-model="treeParams.scale.second" type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </template>
      </Accordion>
    </template>
  </ModalDialog>
</template>