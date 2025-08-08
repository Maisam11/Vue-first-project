<template>
  <div>
    <v-card flat class="mb-4 pa-4">
      <v-text-field v-model="name" label="Full Name" required></v-text-field>
      <v-text-field v-model="email" label="Email" type="email" required></v-text-field>
      <v-menu
        v-model="localDateMenu"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="dob"
            label="Date of Birth"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="dob"
          @input="localDateMenu = false"
        ></v-date-picker>
      </v-menu>
      <v-text-field v-model="age" label="Age" type="number"></v-text-field>
    </v-card>
    <v-btn color="primary" @click="$emit('next')">Continue</v-btn>
  </div>
</template>

<script>
export default {
  props: {
    formData: {
      type: Object,
      required: true
    },
    dateMenu: {
      type: Boolean,
      required: true
    }
  },
  emits: ['next', 'update:formData', 'update:dateMenu'],
  computed: {
    name: {
      get() { return this.formData.name },
      set(value) { this.$emit('update:formData', {...this.formData, name: value}) }
    },
    email: {
      get() { return this.formData.email },
      set(value) { this.$emit('update:formData', {...this.formData, email: value}) }
    },
    dob: {
      get() { return this.formData.dob },
      set(value) { this.$emit('update:formData', {...this.formData, dob: value}) }
    },
    age: {
      get() { return this.formData.age },
      set(value) { this.$emit('update:formData', {...this.formData, age: value}) }
    },
    localDateMenu: {
      get() { return this.dateMenu },
      set(value) { this.$emit('update:dateMenu', value) }
    }
  }
}
</script>