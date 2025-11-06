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
      :readonly="column.readonly || readonly"
      :width="column.width" />
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
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      localData: [],
      isUpdating: false,
    };
  },
  watch: {
    value: {
      handler(newData) {
        if (!this.isUpdating) {
          console.log('External data update received:', newData);
          this.localData = JSON.parse(JSON.stringify(newData));
        }
      },
      deep: true,
      immediate: true,
    },
    localData: {
      handler(newData) {
        if (!this.isUpdating) {
          console.log('Emitting data changes:', newData);
          this.isUpdating = true;
          this.$emit('input', JSON.parse(JSON.stringify(newData)));
          this.$emit('update:value', JSON.parse(JSON.stringify(newData)));
          setTimeout(() => {
            this.isUpdating = false;
          }, 0);
        }
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