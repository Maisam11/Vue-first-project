<template>
    <v-text-field
      :label="label"
      :type="type"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :prepend-icon="prependIcon"
      :append-icon="appendIcon"
      :error="error"
      :error-messages="errorMessages"
      :dense="dense"
      :outlined="outlined"
      :filled="filled"
      :solo="solo"
      @input="$emit('input', $event)"
    ></v-text-field>
  </template>
  
  <script>
  export default {
    props: {
      value: [String, Number],
      label: String,
      type: { type: String, default: "text" },
      placeholder: String,
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false },
      required: { type: Boolean, default: false },
      maxlength: Number,
      prependIcon: String,
      appendIcon: String,
      error: { type: Boolean, default: false },
      errorMessages: [String, Array],
      dense: { type: Boolean, default: false },
      outlined: { type: Boolean, default: false },
      filled: { type: Boolean, default: false },
      solo: { type: Boolean, default: false },
    },
  };
  </script>
  