<template>
  <div>
    <v-stepper v-model="currentStep" vertical>
      <v-stepper-step :complete="currentStep > 1" step="1" editable>
        Basic Information
      </v-stepper-step>
      
      <v-stepper-content step="1">
        <step1-basic-info
          :form-data="formData"
          :date-menu="dateMenu"
          @next="currentStep = 2"
          @update:formData="formData = $event"
          @update:dateMenu="dateMenu = $event"
        />
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 2" step="2" editable>
        Contact Information
      </v-stepper-step>
      
      <v-stepper-content step="2">
        <step2-contact-info
          :form-data="formData"
          @next="currentStep = 3"
          @back="currentStep = 1"
          @update:formData="formData = $event"
        />
      </v-stepper-content>

      <v-stepper-step :complete="currentStep > 3" step="3" editable>
        Address Information
      </v-stepper-step>
      
      <v-stepper-content step="3">
        <step3-address-info
          :form-data="formData"
          @next="currentStep = 4"
          @back="currentStep = 2"
          @update:formData="formData = $event"
        />
      </v-stepper-content>

      <v-stepper-step step="4">
        Verification
      </v-stepper-step>
      
      <v-stepper-content step="4">
        <step4-verification
          :form-data="formData"
          @submit="submitForm"
          @back="currentStep = 3"
        />
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Step1BasicInfo from "@/components/mixins/Step1BasicInfo.vue";
import Step2ContactInfo from "@/components/mixins/Step2ContactInfo.vue";
import Step3AddressInfo from "@/components/mixins/Step3AddressInfo.vue";
import Step4Verification from "@/components/mixins/Step4Verification.vue";

export default {
  name: "VueStepper",
  components: {
    Step1BasicInfo,
    Step2ContactInfo,
    Step3AddressInfo,
    Step4Verification
  },
  data() {
    return {
      currentStep: 1,
      dateMenu: false,
      loading: false,
      formData: {
        name: '',
        email: '',
        dob: '',
        age: '',
        homePhone: '',
        mobilePhone: '',
        addresses: [
          {
            street: '',
            state: '',
            province: '',
            zipCode: ''
          }
        ]
      },
      editedItem: null
    }
  },
  methods: {
    ...mapActions('users', ['addFormSubmission', 'updateFormSubmission']),
    async submitForm() {
      try {
        this.loading = true;
        
        if (!this.editedItem) {
          const randomId = `form-${Date.now()}`;
          this.formData.id = randomId;
        }
        
        const submissionData = {
          ...this.formData,
          addresses: JSON.parse(JSON.stringify(this.formData.addresses))
        };
        
        if (this.editedItem) {
          await this.updateFormSubmission(submissionData);
          if (this.$toast) {
            this.$toast.success('Form updated successfully!');
          } else {
            console.log('Form updated successfully!');
          }
        } else {
          await this.addFormSubmission(submissionData);
          if (this.$toast) {
            this.$toast.success('Form submitted successfully!');
          } else {
            console.log('Form submitted successfully!');
          }
        }
        
        this.resetForm();
      } catch (error) {
        const errorMessage = error.message || 'An error occurred while submitting the form';
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error('Submission error:', errorMessage);
        }
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        dob: '',
        age: '',
        homePhone: '',
        mobilePhone: '',
        addresses: [
          {
            street: '',
            state: '',
            province: '',
            zipCode: ''
          }
        ]
      };
      this.currentStep = 1;
      this.editedItem = null;
    }
  }
}
</script>

<style scoped>
.v-icon {
  cursor: pointer;
}
.v-icon:hover {
  opacity: 0.8;
}
</style>