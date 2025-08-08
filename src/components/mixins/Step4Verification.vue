<template>
  <div>
    <v-card flat class="mb-4 pa-4">
      <h3 class="mb-4">Verify your information:</h3>
      
      <v-list dense>
        <v-list-item>
          <v-list-item-content>Name:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.name }}</v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>Email:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.email }}</v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>Date of Birth:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.dob }}</v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>Age:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.age }}</v-list-item-content>
        </v-list-item>
                <v-subheader>Contact Information</v-subheader>

        <v-list-item>
          <v-list-item-content>Home Phone:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.homePhone }}</v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>Mobile Phone:</v-list-item-content>
          <v-list-item-content class="align-end">{{ formData.mobilePhone }}</v-list-item-content>
        </v-list-item>
        
        <v-subheader>Addresses</v-subheader>
        <div v-for="(address, index) in formData.addresses" :key="'verify-'+index">
          <v-list-item>
            <v-list-item-content>Street:</v-list-item-content>
            <v-list-item-content class="align-end">{{ address.street }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>State:</v-list-item-content>
            <v-list-item-content class="align-end">{{ address.state }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Province:</v-list-item-content>
            <v-list-item-content class="align-end">{{ address.province }}</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>Zip Code:</v-list-item-content>
            <v-list-item-content class="align-end">{{ address.zipCode }}</v-list-item-content>
          </v-list-item>
          <v-divider v-if="index < formData.addresses.length - 1"></v-divider>
        </div>
      </v-list>
    </v-card>
    <v-btn color="primary" @click="$emit('submit')">Confirm</v-btn>
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
  emits: ['submit', 'back']
}
</script>