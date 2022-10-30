<script setup lang="ts">
import LineIcon from "@/components/icons/LineIcon.vue"
import PolygonIcon from "@/components/icons/PolygonIcon.vue"
import RectangleIcon from "@/components/icons/RectangleIcon.vue"
import TriangleIcon from "@/components/icons/TriangleIcon.vue"
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/solid"

import { EditorMode } from "@/core/editorMode"
import { Line } from "@/shapes/line"
import { Polygon } from "@/shapes/polygon"
import { Rectangle } from "@/shapes/rectangle"
import { Triangle } from "@/shapes/triangle"

const emit = defineEmits(["clearCanvas", "onToolChange", "onModeChange"])
function setActive(ev: MouseEvent, eventName: "clearCanvas" | "onToolChange" | "onModeChange", arg: any) {
  let selector = ".mode"
  if (eventName.indexOf("Mode") === -1) { selector = ".tool" }

  document.querySelectorAll(selector).forEach(element => {
    element.classList.remove("button-active")
  })

  // @ts-ignore
  ev.currentTarget.classList.add("button-active")

  emit(eventName, arg)
}
</script>

<template>
  <div class="flex flex-auto pt-1">
    <div class="mode button button-active" @click="setActive($event, 'onModeChange', EditorMode.Drawing)">
      <PlusIcon aria-hidden="true" />
    </div>
    <div class="mode button" @click="setActive($event, 'onModeChange', EditorMode.Selecting)">
      <PencilIcon aria-hidden="true" />
    </div>
    <div class="separator"></div>
    <div class="tool button button-active" @click="setActive($event, 'onToolChange', Line)">
      <LineIcon />
    </div>
    <div class="tool button" @click="setActive($event, 'onToolChange', Triangle)">
      <TriangleIcon />
    </div>
    <div class="tool button" @click="setActive($event, 'onToolChange', Rectangle)">
      <RectangleIcon />
    </div>
    <div class="tool button" @click="setActive($event, 'onToolChange', Polygon)">
      <PolygonIcon />
    </div>
    <div class="separator"></div>
    <div class="button" @click="$emit('clearCanvas')">
      <TrashIcon />
    </div>
    <!--   <div v-if="false">
      <div class="button">
        <DownloadIcon />
      </div>
      <div class="button">
        <UploadIcon />
      </div>
    </div> -->
  </div>
</template>


<style scoped>
.button {
  color: black;
  padding: 0px 4px 4px 4px;
  height: 24px;
  width: 24px;
  box-sizing: content-box;
}

.button:hover {
  color: rgb(115, 113, 206);
}

.button-active {
  color: blue;
}

.separator {
  float: left;
  width: 1px;
  height: 20px;
  background: #888888;
  margin-left: 6px;
  margin-right: 6px;
  margin-top: 4px;
}
</style>