import { def } from '@vue/shared';
<script setup lang="ts">
import { defaultShapeProperties, ShapeProperties } from "@/core/shapeProperties";
import { Vector2 } from "@/core/vector2";
import { Ref, ref, watch } from "vue";

const points: Ref<Vector2[][]> = ref([])
const currentValues = ref(defaultShapeProperties.createCopy())
const isShapeSelected = ref(false)

const emit = defineEmits(["openOperations", "removeSelected", "shapePropertiesChanged", "shapePointChanged", "openFractalTree", "createSpline", "morphing"])

watch(currentValues, () => {
  emit("shapePropertiesChanged", currentValues.value.createCopy())
}, { deep: true })

watch(points, () => {
  emit("shapePointChanged", points.value)
})

function updateShapeProperty(shapeProperty: ShapeProperties) {
  currentValues.value = shapeProperty
}
function updateShapePoints(shapePoints: Vector2[][]) {
  points.value = shapePoints
}
function updateShapeSelectedStatus(shapeSelected: boolean) {
  isShapeSelected.value = shapeSelected
}

defineExpose({ updateShapePoints, updateShapeProperty, updateShapeSelectedStatus })
</script>

<template>
  <div class="sidebar">
    <div class="heading">Свойства</div>

    <div class="param">
      <div>Цвет фигур</div>
      <input v-model="currentValues.shapeColor" type="color">
    </div>

    <div class="param">
      <div>Цвет заливки</div>
      <input v-model="currentValues._fillColorHex" type="color">
    </div>

    <div class="param">
      <div>Прозрачность заливки</div>
      <input v-model="currentValues.alpha" type="range" min="0" max="1" step="0.1">
    </div>

    <div class="param">
      <div>Толщина линии</div>
      <input v-model="currentValues.lineWidth" class="bg-gray-50 border border-gray-300 rounded-lg w-full block"
        type="number" min="1">
    </div>

    <div class="param">
      <button
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-indigo-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-25 hover:bg-indigo-400"
        :disabled="!isShapeSelected" @click="$emit('openOperations')">Операции</button>
    </div>
    <div class="param">
      <button
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-cyan-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cyan-500 disabled:opacity-25 hover:bg-cyan-400"
        :disabled="!isShapeSelected || points.length < 0  || (points.length > 0 && points[0].length < 4)"
        @click="$emit('createSpline')">Создать сплайн</button>
    </div>
    <div class="param">
      <button
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-cyan-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cyan-500 disabled:opacity-25 hover:bg-cyan-400"
        :disabled="points.length === 0  || points.length < 2 || (points.length > 1 && points[0].length !== points[1].length)"
        @click="$emit('morphing')">Морфинг</button>
    </div>
    <div class="param">
      <button
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-25 hover:bg-red-400"
        :disabled="!isShapeSelected" @click="$emit('removeSelected')">Удалить</button>
    </div>

    <div class="param">
      <button
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 hover:bg-indigo-400"
        @click="$emit('openFractalTree')">Фрактальное дерево</button>
    </div>

    <div v-if="points.length > 0">
      <div class="heading">Точки</div>
      <div v-for="pp of points">
        <div v-for="point in pp">
          <input v-model="point.x" type="number">
          <input v-model="point.y" type="number">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  float: right;
  width: 200px;

  border: 1px solid;

  padding: 5px;
  padding-top: 0px;
}

.heading {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.param {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}

.param input:last-child {
  margin-left: auto;
}

input[type="range"],
input[type="number"] {
  width: 50px;
}
</style>