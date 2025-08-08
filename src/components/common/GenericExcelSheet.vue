<template>
  <vue-excel-editor
    v-model="localData"
    :ref="editorRef"
    @select="handleRowSelection"
    :enable-select="enableSelect"
    :allow-add-col="allowAddCol"
    style="width: 100%;">
    <vue-excel-column
      v-for="column in columns"
      :key="column.field"
      :field="column.field"
      :label="column.label"
      :type="column.type"
      :readonly="column.readonly"
      :width="column.width"
      :autoFillWidth="true" />
  </vue-excel-editor>
</template>

<script>
export default {
  name: "GenericExcelSheet",
  props: {
    value: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    editorRef: {
      type: String,
      default: "excelEditor",
    },
    type: {
      type: String,
      required: true,
    },
    enableSelect: {
      type: Boolean,
      default: true,
    },
    allowAddCol: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localData: [],
    };
  },
  watch: {
    value: {
      handler(newData) {
        this.localData = [...newData];
      },
      deep: true,
      immediate: true,
    },
    localData: {
      handler(newData) {
        this.$emit('input', newData);
      },
      deep: true,
    }
  },
  methods: {
    handleRowSelection(selected) {
      this.$emit("select", selected);
    },
    refresh() {
      if (this.$refs[this.editorRef]) {
        this.$refs[this.editorRef].refresh();
      }
    },
    setSelectedRows(rows) {
      if (this.$refs[this.editorRef]) {
        this.$refs[this.editorRef].setSelectedRows(rows);
      }
    },
  },
};
</script>