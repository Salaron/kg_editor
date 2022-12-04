<template>
  <div ref="root">
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { ShapeManager } from "@/core/shapeManager"
import * as THREE from "three"
import { Ref, ref } from "vue"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

let root: Ref<HTMLElement | undefined> = ref()

let windowRef: Window | null = null
let open = ref(false)
function openPortal(shapeManager: ShapeManager) {
  open.value = true
  if (!root.value!.lastChild) {
    root.value!.innerHTML = "<div></div>"
  }

  windowRef = window.open("", "", "width=1000,height=800,left=200,top=200")
  windowRef!.document.body.appendChild(root!.value!.lastChild!)
  window!.addEventListener("beforeunload", closePortal)

  initThreeJs(shapeManager)
}

function closePortal() {
  if (windowRef) {
    windowRef.close()
    windowRef = null
    open.value = false

    root.value!.innerHTML = "<div></div>"
  }
}

defineExpose({ openPortal, closePortal })

function initThreeJs(shapeManager: ShapeManager) {
  if (!windowRef) {
    return
  }

  const renderer = new THREE.WebGLRenderer()
  windowRef.document.body.append(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(
    45,
    windowRef.innerWidth / windowRef.innerHeight,
    100,
    200000
  )
  camera.position.set(0, 0, 1000)
  camera.lookAt(0, 0, 0)
  const scene = new THREE.Scene()
  const gridHelper = new THREE.GridHelper(4000, 10, 0x888888, 0x444444)
  const axesHelper = new THREE.AxesHelper(100)

  const orbit = new OrbitControls(camera, renderer.domElement)
  orbit.update()
  orbit.addEventListener("change", () => renderer!.render(scene, camera))

  let lastTimeRender = Date.now()
  function render() {
    if (!renderer) return

    requestAnimationFrame(render)

    const now = Date.now()
    const elapsed = now - lastTimeRender
    if (elapsed < 1000 / 75) return

    lastTimeRender = now - (elapsed % (1000 / 75))
    scene.clear()
    scene.add(gridHelper)
    scene.add(axesHelper)

    shapeManager.shapes.forEach((shape) => shape.draw3d(scene))
    if (shapeManager.drawingShape) shapeManager.drawingShape.draw3d(scene)
    renderer.render(scene, camera)
  }

  function onWindowResize() {
    if (!windowRef || !renderer) return

    const aspect = windowRef.innerWidth / windowRef.innerHeight

    camera.aspect = aspect
    camera.updateProjectionMatrix()

    renderer.setSize(windowRef.innerWidth, windowRef.innerHeight)
  }

  windowRef.addEventListener("resize", onWindowResize)
  requestAnimationFrame(render)
}
</script>
