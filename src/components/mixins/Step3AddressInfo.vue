<template>
  <div>
    <v-card flat class="mb-4 pa-4">
      <div v-for="(address, index) in addresses" :key="index" class="mb-4">
        <v-subheader>Address {{ index + 1 }}</v-subheader>
        <v-text-field v-model="addresses[index].street" label="Street"></v-text-field>
        <v-text-field v-model="addresses[index].state" label="State"></v-text-field>
        <v-text-field v-model="addresses[index].province" label="Province"></v-text-field>
        <v-text-field v-model="addresses[index].zipCode" label="Zip Code"></v-text-field>
        <v-btn v-if="index > 0" color="error" small @click="removeAddress(index)">Remove</v-btn>
      </div>
      <v-btn color="secondary" @click="addAddress">Add Another Address</v-btn>
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
    addresses: {
      get() {
        return this.formData.addresses;
      },
      set(value) {
        this.$emit('update:formData', { ...this.formData, addresses: value });
      }
    }
  },
  methods: {
    addAddress() {
      this.addresses = [
        ...this.addresses,
        { street: '', state: '', province: '', zipCode: '' }
      ];
    },
    removeAddress(index) {
      const addresses = [...this.addresses];
      addresses.splice(index, 1);
      this.addresses = addresses;
    }
  }
}
</script>