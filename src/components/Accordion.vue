<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue"
import { ChevronUpIcon } from "@heroicons/vue/24/solid"

defineProps<{ title: string }>()
</script>

<template>
  <div class="pt-5">
    <Disclosure v-slot="{ open }">
      <DisclosureButton
        class="flex w-full justify-between rounded-lg bg-indigo-100 px-4 py-2 text-left text-md font-medium hover:bg-indigo-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75"
      >
        <span>{{ title }}</span>
        <ChevronUpIcon
          :class="open ? 'rotate-180 transform' : ''"
          class="h-5 w-5 text-indigo-500"
        />
      </DisclosureButton>
      <DisclosurePanel class="px-4 pt-4 pb-2 text-md text-gray-500">
        <slot name="body"></slot>
      </DisclosurePanel>
    </Disclosure>
  </div>
</template>
