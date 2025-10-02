<template>
  <v-stepper vertical class="stepper mr-4 px-2" style="width: 100%; border: 1px solid black;">
    <v-stepper-step
      v-for="(step, index) in steps"
      :key="index"
      :step="index + 1"
      :editable="true"
      :color="excelSubTab === index ? 'primary' : ''"
      style="padding: 9px;"
      @click.stop="selectStep(index)"
    >
      <div @dblclick.stop="enableEdit(index)" @contextmenu.prevent="deleteStep(index)" style="cursor: pointer;">
        <div v-if="step.isEditing">
          <v-text-field
            v-model="step.name"
            @blur="disableEdit(index)"
            :ref="'stepInput' + index"
          />
        </div>
        <span v-else>{{ step.name }}</span>
      </div>
    </v-stepper-step>

    <v-btn color="primary" class="ms-2 mt-2" @click="addNewStep">
      Add Step
    </v-btn>
  </v-stepper>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "StepperComp",
  computed: {
    ...mapGetters("excel", ["getSteps", "getExcelSubTab", "getCustomData"]),
    steps() {
      return this.getSteps;
    },
    excelSubTab() {
      return this.getExcelSubTab;
    },
  },
  methods: {
    ...mapActions("excel", ["setSteps", "setExcelSubTab", "setCustomData"]),
    addNewStep() {
      const newStepName = `Step ${this.steps.length + 1}`;
      const newSteps = [...this.steps, { name: newStepName, isEditing: false }];
      this.setSteps(newSteps);
      this.setExcelSubTab(newSteps.length - 1);
      const newCustomData = [...this.getCustomData, [{ name: "", email: "", phone: "", age: "" }]];
      this.setCustomData(newCustomData);
    },
    selectStep(index) {
      this.setExcelSubTab(index);
    },
    enableEdit(index) {
      const newSteps = [...this.steps];
      newSteps[index].isEditing = true;
      this.setSteps(newSteps);
      this.$nextTick(() => {
        const input = this.$refs["stepInput" + index]?.[0];
        if (input) {
          input.focus();
        }
      });
    },
    disableEdit(index) {
      const newSteps = [...this.steps];
      newSteps[index].isEditing = false;
      this.setSteps(newSteps);
    },
    deleteStep(index) {
      const newSteps = [...this.steps];
      newSteps.splice(index, 1);
      this.setSteps(newSteps);

      const newCustomData = [...this.getCustomData];
      newCustomData.splice(index, 1);
      this.setCustomData(newCustomData);

      if (this.excelSubTab >= newSteps.length && newSteps.length > 0) {
        this.setExcelSubTab(newSteps.length - 1);
      } else if (newSteps.length === 0) {
        this.setExcelSubTab(0);
      }
    },
  },
};
</script>

<style scoped>
.stepper {
  width: 100%;
}
</style>