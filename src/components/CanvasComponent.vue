<script setup lang="ts">
import { ShapeManager } from "@/core/shapeManager"
import { onMounted, onUnmounted, Ref, ref } from "vue"

const canvas: Ref<HTMLCanvasElement | null> = ref(null)
let shapeManager: ShapeManager | null = null

function waitMounted() {
  return new Promise((res) => {
    const interval = setInterval(() => {
      if (isMounted) {
        clearInterval(interval)
        res(true)
      }
    }, 100)
  })
}

function getCanvasElement(): HTMLCanvasElement {
  return canvas.value!
}

function initialize(manager: ShapeManager, readonly = false) {
  shapeManager = manager
  window.addEventListener("resize", shapeManager.updateSize)

  if (!readonly) {
    canvas.value!.addEventListener("mousemove", (ev) =>
      shapeManager!.onMouseAction(ev, 0)
    )
    canvas.value!.addEventListener("mousedown", (ev) =>
      shapeManager!.onMouseAction(ev, 1)
    )
    canvas.value!.addEventListener("mouseup", (ev) =>
      shapeManager!.onMouseAction(ev, 2)
    )
  }

  window.dispatchEvent(new Event("resize"))
  shapeManager.update()
}

let isMounted = false
onMounted(() => {
  isMounted = true
})

onUnmounted(() => {
  if (shapeManager === null) return

  window.removeEventListener("resize", shapeManager!.updateSize)
})

defineExpose({ initialize, getCanvasElement, waitMounted })
</script>

<template>
  <canvas ref="canvas" class="canvas" oncontextmenu="return false;"></canvas>
</template>

<style scoped>
.canvas {
  border: 1px solid black;
  background-color: rgb(255, 255, 255);
}
</style>
