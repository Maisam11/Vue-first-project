<template>
  <div class="d-flex" style="min-height: 500px; width: 98%;">
    <div style="width: 12%;">
      <StepperComp ref="stepRef" />
    </div>
    <div style="width: 88%; overflow-x: auto;">
      <div>
        <ExcelSheetHeader @save="handleSave" />
      </div>
      <div>
        <v-tabs-items :value="excelSubTab" @change="setExcelSubTab($event)">
          <v-tab-item v-for="(step, index) in steps" :key="index">
            <div class="tab-items-container">
              <GenericExcelSheet
                :value="currentStepData[index] || []"
                :columns="getColumnsForStep(index)"
                :editorRef="getEditorRef(index)"
                :type="getTypeForStep(index)"
                @select="handleRowSelection"
                @update:value="handleDataUpdate(index, $event)"
                :enable-select="true"
                :allow-add-col="true"
                @update:columns="updateColumns(index, $event)"
              />
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericExcelSheet from "@/components/common/GenericExcelSheet.vue";
import ExcelSheetHeader from "@/components/Pages/Excel/ExcelSheetHeader.vue";
import StepperComp from "@/components/Pages/Excel/StepperComp.vue";
import { useExcelColumns } from "@/components/Pages/Excel/excelColumn/useExcelColumns";

export default {
  name: "ExcelView",
  components: { GenericExcelSheet, ExcelSheetHeader, StepperComp },
  setup() {
    const { getColumnsForStep, getEditorRef, getTypeForStep } = useExcelColumns();
    return { getColumnsForStep, getEditorRef, getTypeForStep };
  },
  data() {
    return {
      lastSelectedIndex: null,
      saveTimeout: null,
    };
  },
  computed: {
    ...mapGetters(["getCurrentStepData", "getSteps", "getExcelSubTab", "getSelectedRows", "getCustomData"]),
    currentStepData() {
      return this.getCurrentStepData;
    },
    steps() {
      return this.getSteps;
    },
    excelSubTab() {
      return this.getExcelSubTab;
    },
    currentEditorRef() {
      const activeStep = this.$refs.stepRef ? this.$refs.stepRef.activeStep : this.excelSubTab;
      return this.$refs[`customEditor${activeStep}`];
    },
  },
  watch: {
    currentStepData: {
      handler(newData, oldData) {
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
          this.debounceSave();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    ...mapActions(["setExcelSubTab", "setSelectedRows", "setCustomData", "setCustomColumns"]),
    debounceSave() {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        try {
          const data = this.currentStepData[this.excelSubTab] || [];
          const newCustomData = [...this.getCustomData];
          if (JSON.stringify(newCustomData[this.excelSubTab]) !== JSON.stringify(data)) {
            newCustomData[this.excelSubTab] = data.map(row => ({
              ...row,
              _rowKey: row._rowKey || String(Date.now() + Math.random()),
            }));
            this.setCustomData(newCustomData);
            console.log("Data saved:", newCustomData[this.excelSubTab]);
          }
        } catch (error) {
          console.error("Failed to save data:", error);
        }
      }, 300);
    },
    handleRowSelection(selected) {
      try {
        if (
          Array.isArray(selected) &&
          selected.length === 1 &&
          selected[0] === this.lastSelectedIndex
        ) {
          this.setSelectedRows([]);
          this.lastSelectedIndex = null;
          if (this.currentEditorRef) {
            this.currentEditorRef.setSelectedRows([]);
          }
        } else {
          const currentData = this.currentStepData[this.excelSubTab] || [];
          const newSelectedRows = selected
            .filter((index) => index >= 0 && index < currentData.length)
            .map((index) => ({
              ...currentData[index],
              _rowKey: currentData[index]._rowKey || String(Date.now() + Math.random()),
            }));
          this.setSelectedRows(newSelectedRows);
          this.lastSelectedIndex = selected.length > 0 ? selected[selected.length - 1] : null;
        }
      } catch (error) {
        console.error("Failed to handle row selection:", error);
      }
    },
    handleSave() {
      this.debounceSave();
    },
    handleDataUpdate(index, newData) {
      try {
        const newCustomData = [...this.getCustomData];
        newCustomData[index] = newData.map(row => ({
          ...row,
          _rowKey: row._rowKey || String(Date.now() + Math.random()),
        }));
        this.setCustomData(newCustomData);
        this.debounceSave();
      } catch (error) {
        console.error("Failed to update data:", error);
      }
    },
    updateColumns(index, newColumns) {
      try {
        const newCustomColumns = [...this.getCustomColumns];
        newCustomColumns[index] = newColumns;
        this.setCustomColumns(newCustomColumns);
        this.debounceSave();
      } catch (error) {
        console.error("Failed to update columns:", error);
      }
    },
  },
};
</script>

<style scoped>
:deep(.vue-excel-editor) {
  width: 100%;
}
.tab-items-container {
  padding: 16px;
  border-radius: 4px;
}
</style>