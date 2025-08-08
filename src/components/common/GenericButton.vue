<template>
  <v-tooltip v-if="tooltip" bottom>
    <template v-slot:activator="{ on, attrs }">
      <v-btn 
        v-bind="attrs"
        v-on="on"
        :color="background ? '' : color" 
        :class="backgroundClass"
        :small="size === 'small'" 
        :large="size === 'large'"
        :block="block"
        :loading="loading"
        :disabled="disabled"
        class="auto-width"
        @click="$emit('click')"
      >
        <v-icon v-if="prependIcon" class="mr-1">{{ prependIcon }}</v-icon>
        <v-icon v-if="icon">{{ icon }}</v-icon>
        <slot></slot>
        <v-icon v-if="appendIcon" class="ml-1">{{ appendIcon }}</v-icon>
      </v-btn>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>

  <v-btn 
    v-else
    :color="background ? '' : color" 
    :class="backgroundClass"
    :small="size === 'small'" 
    :large="size === 'large'"
    :block="block"
    :loading="loading"
    :disabled="disabled"
    class="auto-width"
    @click="$emit('click')"
  >
    <v-icon v-if="prependIcon" class="mr-1">{{ prependIcon }}</v-icon>
    <v-icon v-if="icon">{{ icon }}</v-icon>
    <slot></slot>
    <v-icon v-if="appendIcon" class="ml-1">{{ appendIcon }}</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: {
    color: { type: String, default: "" }, 
    background: { type: Boolean, default: false },
    icon: { type: String, default: "" },
    prependIcon: { type: String, default: "" }, 
    appendIcon: { type: String, default: "" }, 
    size: { type: String, default: "default" },
    block: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    tooltip: { type: String, default: "" } // ✅ NEW PROP for tooltip
  },
  computed: {
    backgroundClass() {
      return this.background ? `bg-${this.color} white--text px-3` : "";
    }
  }
};
</script>

<style scoped>
.auto-width {
  min-width: auto !important;
  width: auto !important;
  display: inline-flex !important;
  text-transform: none !important;
  border-radius: 4px;
  margin-right: 2px;
  border: none;
  box-shadow: none;
}
</style>
