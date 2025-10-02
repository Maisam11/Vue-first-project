<template>
  <div class="d-flex justify-end mb-4" style="margin-inline: 1rem;">
    <div v-if="(selectedRows || []).length > 0">
      <GenericButton @click="addRows('above')" icon="mdi-arrow-up blue--text" id="add-above-row-btn" class="mr-2"
        tooltip="Add Above" />

      <GenericButton @click="addRows('below')" icon="mdi-arrow-down blue--text" id="add-below-row-btn" class="mr-2"
        tooltip="Add Below" />

      <GenericButton @click="deleteSelectedRows" icon="mdi-delete red--text" id="delete-row-btn" class="mr-2"
        tooltip="Delete Row" />
    </div>

    <GenericButton v-if="(selectedRows || []).length === 0" @click="addExcelRow" icon="mdi-plus-box-outline blue--text" id="add-row-btn"
      class="mr-2" tooltip="Add Row" />

    <GenericButton color="success" background @click="downloadExcel" icon="mdi-download" id="excel-btn"
      tooltip="Download as Excel">
      Excel
    </GenericButton>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenericButton from "@/components/common/GenericButton.vue";
import * as XLSX from "xlsx";
import { useExcelColumns } from "../Excel/excelColumn/useExcelColumns"

export default {
  name: "ExcelSheetHeader",
  components: { GenericButton },
  setup() {
    const { getColumnsForStep } = useExcelColumns();
    return { getColumnsForStep };
  },
  computed: {
    ...mapGetters("excel", ["getSelectedRows", "getCustomData", "getSteps", "getExcelSubTab", "getCurrentStepData"]),
    selectedRows() {
      return this.getSelectedRows || [];
    },
    customData() {
      return this.getCustomData || [];
    },
    steps() {
      return this.getSteps || [];
    },
    excelSubTab() {
      return this.getExcelSubTab || 0;
    },
    currentStepData() {
      return this.getCurrentStepData || {};
    },
  },
  methods: {
    ...mapActions("excel", ["setCustomData", "setSelectedRows"]),
    downloadExcel() {
      try {
        const workbook = XLSX.utils.book_new();
        this.steps.forEach((step, index) => {
          const stepName = step.name || `Sheet${index + 1}`;
          const data = this.customData[index] || [];
          const columns = this.getColumnsForStep();
          const worksheetData = data.map((row) => {
            const rowData = {};
            columns.forEach((col) => {
              rowData[col.label] = String(row[col.field] || "--");
            });
            return rowData;
          });
          const worksheet = XLSX.utils.json_to_sheet(worksheetData);
          worksheet["!cols"] = columns.map(() => ({ wch: 15 }));
          XLSX.utils.book_append_sheet(workbook, worksheet, stepName);
        });
        XLSX.writeFile(workbook, "CustomData.xlsx");
      } catch (error) {
        console.error("Failed to download Excel:", error);
      }
    },
    addExcelRow() {
      try {
        const columns = this.getColumnsForStep();
        const newRow = {
          rowKey: String(Date.now() + Math.random()),
        };
        columns.forEach((col) => {
          newRow[col.field] = col.type === "number" ? "" : col.type === "string" ? "" : "";
        });
        const newCustomData = [...(this.customData || [])];
        if (!newCustomData[this.excelSubTab]) {
          newCustomData[this.excelSubTab] = [];
        }
        newCustomData[this.excelSubTab] = [...newCustomData[this.excelSubTab], { ...newRow }];
        this.setCustomData(newCustomData);
        this.setSelectedRows([]);
        this.$emit('save');
      } catch (error) {
        console.error("Failed to add row:", error);
      }
    },
    addRows(position) {
      try {
        const currentData = this.currentStepData[this.excelSubTab] || [];
        const indices = this.selectedRows
          .map((row) => currentData.findIndex((r) => r.rowKey === row.rowKey))
          .filter((index) => index !== -1);
        if (indices.length === 0) {
          return;
        }
        let newData = [...currentData];
        const sortedIndices = [...indices].sort((a, b) => a - b);
        const offsetIncrement = position === "above" ? 0 : 1;
        const columns = this.getColumnsForStep();
        let offset = 0;
        sortedIndices.forEach((index) => {
          if (index >= 0 && index <= newData.length - offsetIncrement) {
            const newRow = {
              rowKey: String(Date.now() + Math.random()),
            };
            columns.forEach((col) => {
              newRow[col.field] = col.type === "number" ? "" : col.type === "string" ? "" : "";
            });
            newData.splice(index + offset + offsetIncrement, 0, { ...newRow });
            offset++;
          }
        });
        this.updateCurrentStepData(newData);
        this.setSelectedRows([]);
        this.$emit('save');
      } catch (error) {
        console.error("Failed to add rows:", error);
      }
    },
    deleteSelectedRows() {
      try {
        const currentData = this.currentStepData[this.excelSubTab] || [];
        const newData = currentData.filter((row) => !this.selectedRows.some((selected) => selected.rowKey === row.rowKey));
        this.updateCurrentStepData(newData);
        this.setSelectedRows([]);
        this.$emit('save');
      } catch (error) {
        console.error("Failed to delete rows:", error);
      }
    },
    updateCurrentStepData(newData) {
      const newCustomData = [...(this.customData || [])];
      newCustomData[this.excelSubTab] = [...newData];
      this.setCustomData(newCustomData);
    },
  },
  emits: ["save"],
};
</script>