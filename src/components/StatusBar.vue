<script setup lang="ts">
import { Vector } from "@/core/vector"
import { ref, watch } from "vue"

const mouseCoords = ref(new Vector(0, 0))

function update(newMouseCoords: Vector) {
  mouseCoords.value = newMouseCoords
}

defineExpose({ update })
</script>
  
<template>
  <div class="statusbar">
    <div style="margin: 10px">Положение курсора:
      <span>
        {{ mouseCoords.toString() }}
      </span>
    </div>
  </div>
</template>
  
  
<style scoped>
.statusbar {
  border: 1px solid;

  border-color: black;
  border-style: solid;
  background-color: rgb(255, 255, 255);
}
</style>