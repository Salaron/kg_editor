<script setup lang="ts">
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue"
import { ref } from "vue"

const props = defineProps<{
  onCancel: () => void
  onSave: () => void
  fullWidth?: boolean
  onlyOkButton?: boolean
}>()
const opened = ref(false)

const close = () => {
  opened.value = false
}

const open = () => {
  opened.value = true
}

defineExpose({ close, open })
</script>

<template>
  <TransitionRoot as="template" :show="opened">
    <Dialog as="div" class="fixed z-100 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
          leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-slate-700 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div :class="[
            fullWidth ? 'w-1/2 h-1/2' : 'sm:max-w-lg sm:w-full',
            'relative inline-block align-bottom bg-white rounded-lg text-left overflow-y-visible shadow-xl transform transition-all sm:my-8 sm:align-middle ',
          ]">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg">
              <div class="mt-3 text-center sm:mt-0  sm:text-left">
                <DialogTitle as="h2" class="text-xl leading-6 font-big text-gray-900 mb-5">
                  <slot name="title"></slot>
                </DialogTitle>
                <div class="mt-2">
                  <slot name="body"></slot>
                </div>
              </div>
            </div>
            <div :class="[
              'bg-gray-50 px-4 py-3 sm:px-6 sm:flex rounded-b-lg',
              onlyOkButton ? 'sm:justify-center' : 'sm:flex-row-reverse',
            ]">
              <button type="button"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                @click="props.onSave()">
                {{ onlyOkButton ? "ОК" : "Сохранить" }}
              </button>
              <button v-if="!onlyOkButton" type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="props.onCancel()">
                Отмена
              </button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
