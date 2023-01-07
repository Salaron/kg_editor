<script setup lang="ts">
import Accordion from "@/components/Accordion.vue"
import CanvasComponent from "@/components/CanvasComponent.vue"
import ModalDialog from "@/components/ModalDialog.vue"
import { Operations } from "@/core/operations"
import { ShapeManager } from "@/core/shapeManager"
import { ShapeProperties } from "@/core/shapeProperties"
import { Shape } from "@/shapes/shape"
import { deepClone } from "@/util/object"
import { computed, ref, watch } from "vue"
import draggable from "vuedraggable"

const height = ref(innerHeight * 0.5)

const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)
const operationsCanvasComponent = ref<InstanceType<
  typeof CanvasComponent
> | null>(null)

const operationsDefaultValue = [
  {
    id: 0,
    name: "Смещение",
    param1: {
      type: "text",
      text: "Смещение по X",
      value: "0",
    },
    param2: {
      type: "text",
      text: "Смещение по Y",
      value: "0",
    },
    param3: {
      type: "text",
      text: "Смещение по Z",
      value: "0",
    },
  },
  {
    id: 1,
    name: "Масштабирование",
    param1: {
      type: "text",
      text: "Масштабирование по X",
      value: "1",
    },
    param2: {
      type: "text",
      text: "Масштабирование по Y",
      value: "1",
    },
    param3: {
      type: "text",
      text: "Масштабирование по Z",
      value: "1",
    },
  },
  {
    id: 2,
    name: "Поворот X",
    param1: {
      type: "text",
      text: "Угол поворота относительно оси X",
      value: "0",
    },
  },
  {
    id: 3,
    name: "Поворот Y",
    param1: {
      type: "text",
      text: "Угол поворота относительно оси Y",
      value: "0",
    },
  },
  {
    id: 4,
    name: "Поворот Z",
    param1: {
      type: "text",
      text: "Угол поворота относительно оси Z",
      value: "0",
    },
  },
  {
    id: 5,
    name: "Зеркалирование",
    param1: {
      type: "checkbox",
      text: "Зеркалирование относительно прямой х = 0",
      value: false,
    },
    param2: {
      type: "checkbox",
      text: "Зеркалирование относительно прямой y = 0",
      value: false,
    },
  },
  {
    id: 6,
    name: "Проецирование",
    param1: {
      type: "text",
      text: "Проецирование на Х",
      value: 0,
    },
    param2: {
      type: "text",
      text: "Процирование на Y",
      value: 0,
    },
    param3: {
      type: "text",
      text: "Процирование на Z",
      value: 0,
    },
  },
]
const operations = ref(deepClone(operationsDefaultValue))
const morphing = ref(1)

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
  operations.value = deepClone(operationsDefaultValue)
  morphing.value = 1

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
  [morphing, operations],
  () => {
    if (!shapeManager) return

    const shapesCopy = deepClone(shapeManager.shapes)
    previewShapes = applyOperations(shapesCopy)
  },
  { deep: true }
)

const emit = defineEmits(["operationDialogClosed"])

function applyOperations(shapes: Shape[]): Shape[] {
  return shapes.map((shape) => {
    const originalPoints = new Operations(
      deepClone(shape.points)
    ).convertToScreen()
    const operationBuilder = new Operations(
      deepClone(shape.points)
    ).convertToScreen()

    for (const operation of operations.value) {
      if (operation.id === 0)
        operationBuilder.transfer(
          parseInt(operation.param1.value as string),
          parseInt(operation.param2!.value as string),
          parseInt(operation.param3!.value as string)
        )

      if (operation.id === 1)
        operationBuilder.scale(
          parseFloat(operation.param1.value as string),
          parseFloat(operation.param2!.value as string),
          parseFloat(operation.param3!.value as string)
        )

      if (operation.id === 2)
        operationBuilder.rotateX(parseInt(operation.param1.value as string))

      if (operation.id === 3)
        operationBuilder.rotateY(parseInt(operation.param1.value as string))

      if (operation.id === 4)
        operationBuilder.rotateZ(parseInt(operation.param1.value as string))

      if (operation.id === 5)
        operationBuilder.mirror(
          operation.param2!.value as boolean,
          operation.param1.value as boolean,
          false
        )
    }
    shape.properties = new ShapeProperties(
      "#00ff00",
      shape.properties.lineWidth + 1,
      shape.properties.fillColorHex,
      shape.properties.alpha
    )
    shape.points = originalPoints
      .morphing(operationBuilder.finish(), morphing.value)
      .convertToSystem()
      .round()
      .finish()
    return shape
  })
}

function onSave() {
  morphing.value = 1
  const result = applyOperations(originalShapes)
  console.log(result)
  emit("operationDialogClosed", result)
  dispose()
  dialog.value?.close()
}

function onCancel() {
  dialog.value?.close()
}

function dispose() {
  previewShapes = []
  originalShapes = []
  shapeManager?.dispose()
  shapeManager = null
}

const dragOptions = computed(() => {
  return {
    animation: 200,
    group: "description",
    disabled: false,
    ghostClass: "ghost",
  }
})
const drag = ref(false)

defineExpose({ openOperationsDialog })
</script>

<template>
  <ModalDialog ref="dialog" :on-save="onSave" :on-cancel="onCancel" :full-width="true">
    <template #title> Операции </template>
    <template #body>
      <CanvasComponent ref="operationsCanvasComponent" :style="{ height: height + 'px' }" />

      <label>Превью</label>
      <input v-model="morphing" type="range" min="0" max="1" step="0.01" class="ml-2" />

      <draggable v-bind="dragOptions" v-model="operations" class="list-group" :component-data="{
  type: 'transition-group',
  name: !drag ? 'flip-list' : null,
}" item-key="id" @start="drag = true" @end="drag = false">
        <template #item="{ element }">
          <Accordion :title="element.name">
            <template #body>
              <label class="block mb-2 text-base font-medium text-gray-900">{{
    element.param1.text
}}</label>
              <input v-model="element.param1.value" :type="element.param1.type" :class="[
  element.param1.type === 'text'
    ? 'bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
    : '',
]" />

              <div v-if="element.param2" class="mt-2">
                <label class="block mb-2 text-base font-medium text-gray-900">{{
    element.param2.text
}}</label>
                <input v-model="element.param2.value" :type="element.param2.type" :class="[
  element.param2.type === 'text'
    ? 'bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
    : '',
]" />
              </div>

              <div v-if="element.param3" class="mt-2">
                <label class="block mb-2 text-base font-medium text-gray-900">{{
    element.param3.text
}}</label>
                <input v-model="element.param3.value" :type="element.param3.type" :class="[
  element.param3.type === 'text'
    ? 'bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
    : '',
]" />
              </div>
            </template>
          </Accordion>
        </template>
      </draggable>
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
