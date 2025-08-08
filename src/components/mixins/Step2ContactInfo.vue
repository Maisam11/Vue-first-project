<template>
  <div>
    <v-card flat class="mb-4 pa-4">
      <v-text-field v-model="homePhone" label="Home Phone"></v-text-field>
      <v-text-field v-model="mobilePhone" label="Mobile Phone" required></v-text-field>
    </v-card>
    <v-btn color="primary" @click="$emit('next')">Continue</v-btn>
    <v-btn text @click="$emit('back')">Back</v-btn>
  </div>
</template>

<script>
export default {
  props: {
    formData: {
      type: Object,
      required: true
    }
  },
  emits: ['next', 'back', 'update:formData'],
  computed: {
    homePhone: {
      get() { return this.formData.homePhone },
      set(value) { this.$emit('update:formData', {...this.formData, homePhone: value}) }
    },
    mobilePhone: {
      get() { return this.formData.mobilePhone },
      set(value) { this.$emit('update:formData', {...this.formData, mobilePhone: value}) }
    }
  }
}
</script>